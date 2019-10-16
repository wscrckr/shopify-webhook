const crypto = require('crypto');
const SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;

var getDigest = (secret, rawBody) => {

  // let jsonString = JSON.stringify(body);
  // console.log('Body length:' + jsonString.length)

  let digest = crypto.createHmac("sha256", secret)
      .update(rawBody, 'utf8', 'hex')
      .digest('base64');
  
  return digest;
}

var shopify = (req, res) => {
  switch (req.method) {
    case 'GET':
      res.status(200);
      res.send({status: 'ok'});
      break;

    case 'POST':
      var shopDigest = req.headers['x-shopify-hmac-sha256'];
      var calcDigest = getDigest(SECRET, req.rawBody);

      console.log('Raw body len: ', req.rawBody.length);
      console.log(req.rawBody.toString());
      console.log('Shop digst: ', shopDigest);
      console.log('Calculated: ', calcDigest);

      if (shopDigest != calcDigest) {
        res.status(403);
        res.send({error: 'Bad HMAC'});
        break;
      }
      res.status(200);
      res.send({status: 'ok'});
      break;

    default:
      res.status(405);
      res.send({error: `Invalid method: ${req.method}`});
  }
};

exports.getDigest = getDigest;
exports.shopify = shopify;
