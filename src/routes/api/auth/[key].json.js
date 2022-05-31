
/*
func (fes *APIServer) ValidateJWT(publicKey string, jwtToken string) (bool, error) {
	pubKeyBytes, _, err := lib.Base58CheckDecode(publicKey)
	if err != nil {
		return false, err
	}

	pubKey, err := btcec.ParsePubKey(pubKeyBytes, btcec.S256())
	if err != nil {
		return false, err
	}

	token, err := jwt.Parse(jwtToken, func(token *jwt.Token) (interface{}, error) {
		return pubKey.ToECDSA(), nil
	})

	return token.Valid, err
}
*/

import b58 from 'bs58check';

import {
  getFollows,
  getProfile
} from "../../bitclout/common"

import jsonwebtoken from 'jsonwebtoken';
import {ec} from 'elliptic';
import KeyEncoder from 'key-encoder';
import axios from 'axios';
let ic = new ec("secp256k1");

// thank you, https://github.com/mattetre/bitclout-jwt-validate/blob/main/index.js !!

function validateJwt(bitCloutPublicKey, jwtToken) {
  
  const bitCloutPublicKeyDecoded = b58.decode(bitCloutPublicKey);

  // manipulate the decoded key to remove the prefix that gets added
  // see: privateKeyToBitcloutPublicKey - https://github.com/bitclout/identity/blob/main/src/app/crypto.service.ts#L128

  // turn buffer into an array to easily manipulate
  const bitCloutPublicKeyDecodedArray = [...bitCloutPublicKeyDecoded];
  // Remove the public key prefix to get the 'raw public key'
  // not sure if hardcoding this to 3 elements is safe
  // see: PUBLIC_KEY_PREFIXES - https://github.com/bitclout/identity/blob/main/src/app/crypto.service.ts#L22
  const rawPublicKeyArray = bitCloutPublicKeyDecodedArray.slice(3);

  const rawPublicKeyHex = ic
    .keyFromPublic(rawPublicKeyArray, "hex")
    .getPublic()
    .encode("hex", true);

  const keyEncoder = new KeyEncoder("secp256k1");
  const rawPublicKeyEncoded = keyEncoder.encodePublic(
    rawPublicKeyHex,
    "raw",
    "pem"
  );

  // if the jwt or public key is invalid this will throw an error
  const result = jsonwebtoken.verify(jwtToken, rawPublicKeyEncoded, {
    algorithms: ["ES256"],
    
  });
  return result;
}

export async function get(req, res, next) {
  const { CLOUTCAST_API_URL, CLOUTCAST_API_KEY } = process.env;
  try {
    // let btcDecoder = coinstring.createDecoder(0x00);
    // let ic = new ec('secp256k1');
    console.dir(req.headers);
    let {key} = req.params;
    let {authorization, xjwt} = req.headers;
    
    


    let jt = `${authorization || xjwt}`.split(" ");
    if (!Array.isArray(jt) && jt.length !== 2) {
      res.statusCode = 401;
      return res.end('no');
    }
    let theToken = jt[1];

    let decoded = validateJwt(key, theToken);
    console.dir(decoded);

    if (!decoded) {
      throw new Error("No token.");
    }

    let userProfile = await axios(getProfile(key));

    

    let {Profile} = userProfile.data;
    let {Username = null} = Profile;
    let tUsername = key;

    let followerCount = 0;

    if (!!Username) {
      tUsername = Username;
      let gf = getFollows(Username);
      let af = await axios(gf);
      let fData = af.data;
      // console.log(fData);
      followerCount = fData.NumFollowers || 0;

    }

    console.log({key, tUsername})
     

    let ccToken = await axios.post(`${CLOUTCAST_API_URL}/authenticate`, {}, {
      params: {
        publicKey: key,
        handle: tUsername
      },
      method: 'post',
      headers: {
        "x-api-key" : CLOUTCAST_API_KEY
      }
    });

    // decode to ensure it can
    jsonwebtoken.decode(ccToken.data);

    return res.end(JSON.stringify({
      jwt: ccToken.data,
      Profile: {
        followerCount,
        ...Profile
      }
    }));

    
    

    // return res.end(`${}`);
  } catch (ex) {
    // console.error(ex);
    console.error(ex);
    res.statusCode = 403;
    res.end(ex.message || "no");
  }
}

export async function post(req, res, next) {
  const { CLOUTCAST_API_URL, CLOUTCAST_API_KEY } = process.env;
  try {
    // let btcDecoder = coinstring.createDecoder(0x00);
    // let ic = new ec('secp256k1');
    
    let {key} = req.params;
    // let {authorization, xjwt} = req.headers;
    // let jt = `${authorization || xjwt}`.split(" ");
    // if (!Array.isArray(jt) && jt.length !== 2) {
    //   res.statusCode = 401;
    //   return res.end('no');
    // }
    // let theToken = jt[1];

    let theToken = req.body || null;

    let decoded = validateJwt(key, theToken);
    console.dir(decoded);

    if (!decoded) {
      throw new Error("No token.");
    }

    let userProfile = await axios(getProfile(key));

    

    let {Profile} = userProfile.data;
    let {Username = null} = Profile;
    let tUsername = key;

    let followerCount = 0;

    if (!!Username) {
      tUsername = Username;
      let gf = getFollows(Username);
      let af = await axios(gf);
      let fData = af.data;
      // console.log(fData);
      followerCount = fData.NumFollowers || 0;

    }

    // console.log({key, tUsername})
     

    let ccToken = await axios.post(`${CLOUTCAST_API_URL}/authenticate`, {}, {
      params: {
        publicKey: key,
        handle: tUsername
      },
      method: 'post',
      headers: {
        "x-api-key" : CLOUTCAST_API_KEY
      }
    });

    // decode to ensure it can
    jsonwebtoken.decode(ccToken.data);

    return res.end(ccToken.data);

    
    

    // return res.end(`${}`);
  } catch (ex) {
    // console.error(ex);
    console.error(ex);
    res.statusCode = 403;
    res.end(ex.message || "no");
  }
}


export async function options(req, res, next) {
  res.end();
}