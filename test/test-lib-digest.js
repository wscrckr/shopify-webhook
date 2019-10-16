const assert = require('assert');
const fs = require('fs');
const path = require('path');

const {getDigest} = require('../lib/digest');

const DIGEST_CHECK = process.env.SHOPIFY_WEBHOOK_DIGEST_CHECK;
const SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

describe('Shopify digest calculation', () => {
  it('Should match expected digest value', () => {
    const fname = path.join(__dirname, 'sample-escaped.txt');
    const body = fs.readFileSync(fname, 'utf8');
    const digest = getDigest(SECRET, body);
  
    // Verify behavior
    assert.strictEqual(digest, DIGEST_CHECK);
  });
});
