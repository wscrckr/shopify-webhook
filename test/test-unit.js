const assert = require('assert');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');

const {shopify} = require('..');

describe('Shopify webhook unit test', () => {
  it('Should respond to GET', () => {
    const req = {
      method: 'GET'
    }

    const res = {
      status: sinon.stub(),
      send: sinon.stub()
    }
  
    // Call webhook
    shopify(req, res);
  
    // Verify behavior
    assert.ok(res.send.calledOnce);
  });

  it('Should respond to properly signed POST', () => {
    const fname = path.join(__dirname, 'sample-escaped.txt');
    const body = fs.readFileSync(fname, 'utf8');
    const digest = process.env.SHOPIFY_WEBHOOK_DIGEST_CHECK;

    const req = {
      method: 'POST',
      headers: {
        'X-Shopify-Hmac-Sha256': digest,
        'X-Shopify-API-Version': '2019-10'
      },
      rawBody: body,
    }

    const res = {
      status: sinon.stub(),
      send: sinon.stub()
    }
  
    // Call webhook
    shopify(req, res);
  
    // Verify behavior
    assert.ok(res.send.calledOnce);
  });
});
