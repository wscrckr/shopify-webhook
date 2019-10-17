// Inspired by: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/functions/helloworld/test/sample.integration.http.test.js

const assert = require('assert');
const execPromise = require('child-process-promise').exec;
const fs = require('fs');
const path = require('path');
const requestRetry = require('requestretry');

const PORT = 9010;
const BASE_URL = `http://localhost:${PORT}`;
const cwd = path.join(__dirname, '..');

const SAMPLE_FNAME = path.join(__dirname, 'sample-escaped.txt');
const SAMPLE_BODY = fs.readFileSync(SAMPLE_FNAME, 'utf8');

describe('Shopify HTTP integration test', () => {
  let ffProc;

  // Run the functions-framework instance to host functions locally
  before(() => {
    // exec's 'timeout' param won't kill children of "shim" /bin/sh process
    // Workaround: include "& sleep <TIMEOUT>; kill $!" in executed command
    ffProc = execPromise(
      `functions-framework --target=shopify --signature-type=http --port ${PORT} > output.txt & sleep 2; kill $!`,
      {shell: true, cwd}
    );
  });

  after(async () => {
    // Wait for the functions framework to stop
    await ffProc;
  });

  it('Should send 200 to GET', async () => {
    const response = await requestRetry({
      url: `${BASE_URL}/`,
      method: 'GET',
      retryDelay: 200,
      json: true
    });

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.body.status, `ok`);
  });
  
  it('Should send 200 to properly signed POST', async () => {
    const response = await requestRetry({
      url: `${BASE_URL}/`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-shopify-hmac-sha256': process.env.SHOPIFY_WEBHOOK_DIGEST_CHECK,
        'x-shopify-api-version': '2019-10'
      },
      body: SAMPLE_BODY,
      retryDelay: 200
    });

    assert.strictEqual(response.statusCode, 200);
  });

  it('Should send 403 to improperly signed POST', async () => {
    
    const response = await requestRetry({
      url: `${BASE_URL}/shopify`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Hmac-Sha256': 'IMPROPER SIGNATURE',
        'X-Shopify-API-Version': '2019-10'
      },
      body: SAMPLE_BODY,
      retryDelay: 200
    });

    assert.strictEqual(response.statusCode, 403);
  });

  it('Should send 405 to PUT', async () => {
    const response = await requestRetry({
      url: `${BASE_URL}/shopify`,
      method: 'PUT',
      retryDelay: 200,
      json: true,
    });

    assert.strictEqual(response.statusCode, 405);
  });
});
