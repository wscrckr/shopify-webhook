const crypto = require('crypto');

// Inspired by: https://gist.github.com/andjosh/5c4f0244914adfd312e4#gistcomment-2652536
exports.getDigest = (secret, rawBody) => {

  // let jsonString = JSON.stringify(body);
  // console.log('Body length:' + jsonString.length)

  let digest = crypto.createHmac("sha256", secret)
      .update(rawBody, 'utf8', 'hex')
      .digest('base64');
  
  return digest;
}