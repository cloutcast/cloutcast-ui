
import jwt from 'jsonwebtoken';
import jwkClient from 'jwks-rsa';

export const verifyReq = async function(req, returnToken = false) {
  let {authorization} = req.headers;
    if (!authorization) {
      throw new Error("no authorization header.");
    }
    if (typeof (authorization) !== 'string') {
      throw new Error("auth is not a string.");
    }
    let authParts = authorization.split(" ");
    if (authParts.length !== 2) {
      throw new Error("auth header isn't exacly two split by space");
    }
    let decodedToken = await verifyToken(authParts[1]);
    if (returnToken == true) {
      return [decodedToken, authParts[1]];
    } else {
      return decodedToken;
    }
}


// IS NOT USED!!! 
export const verifyToken = function(theToken) {
  const {JWT_SECRET} = process.env;
  let jClient = jwkClient({
    jwksUri: 'https://cloutcast.us.auth0.com/.well-known/jwks.json'
  });
  function getKeyOld(header, callback) {
    jClient.getSigningKey(header.kid, function(err, key) {
      if (err) { return callback(err); } else {
        var signingKey = key.publicKey || key.rsaPublicKey;
        return callback(null, signingKey);
      }

    })
  }

  function getKey(header, callback) {
    return callback(null, JWT_SECRET);
  }
  
  return new Promise((res, rej) => {
    console.log("VerifyToken init");
    jwt.verify(theToken, getKey, {}, (err, decoded) => {
      if (err) {
        console.warn("VerifyToken error");
        return rej(err);
      } else {
        if (decoded) {
          console.log("VerifyToken complete");
          return res(decoded);
        } else {
          console.log("VerifyToken error");
          return rej(new Error("No token!"));
        }
      }
    });
  });
};