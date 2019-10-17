const {PubSub} = require('@google-cloud/pubsub');
const crypto = require('crypto');

require('dotenv').config()
const SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;
const TOPIC_NAME = process.env.GCP_TOPIC_NAME;

// Creates a client
const pubsub = new PubSub();

// Calculate the digest using the Shopify Secret (ENV VAR)
var getDigest = (secret, rawBody) => {

  // let jsonString = JSON.stringify(body);
  // console.log('Body length:' + jsonString.length)

  let digest = crypto.createHmac("sha256", secret)
      .update(rawBody, 'utf8', 'hex')
      .digest('base64');
  
  return digest;
}

async function publishMessage(data) {

  // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
  const dataBuffer = Buffer.from(data);

  const messageId = await pubsub.topic(TOPIC_NAME).publish(dataBuffer);
  console.log(`Message ${messageId} published.`);
  return messageId;
}

// Implementation of the HTTP(S) API
async function shopify(req, res) {
  switch (req.method) {
    case 'GET':
      res.status(200);
      res.send({status: 'ok'});
      break;

    case 'POST':
      var shopDigest = req.headers['x-shopify-hmac-sha256'];
      var calcDigest = getDigest(SECRET, req.rawBody);

      // console.log('Raw body len: ', req.rawBody.length);
      // console.log(req.rawBody.toString());
      // console.log('Shop digst: ', shopDigest);
      // console.log('Calculated: ', calcDigest);

      if (shopDigest != calcDigest) {
        res.status(403);
        res.send({error: 'Bad HMAC'});
      } else {
        var messageId = await publishMessage(req.rawBody);
        res.status(200);
        res.send({
          status: 'ok',
          messageId: messageId
        });
      }
      break;

    default:
      res.status(405);
      res.send({error: `Invalid method: ${req.method}`});
  }
};

exports.getDigest = getDigest;
exports.shopify = shopify;
