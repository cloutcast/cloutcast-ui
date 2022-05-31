import axios from 'axios';

// import jwt_decode from "jwt-decode";

import {verifyToken} from "../../common";

import {
  nanosToBitClout, getFollows, getProfile, postsForPublicKey, postWithData
} from "../../../bitclout/common";
import e from 'express';


async function postPOW(promoID, userToken) {
  try {
    let {
      CLOUTCAST_API_URL, CLOUTCAST_API_KEY
    } = process.env;

    await axios.post(`${CLOUTCAST_API_URL}/pow/${promoID}`, {}, {
      headers: {
        Authorization: `Bearer ${userToken}`,
        "x-api-key" : CLOUTCAST_API_KEY
      }
    });

    return true;


  } catch (ex) {
    console.error(ex);
    throw ex;
  }
}

export async function get(req, res, next) {
  console.log("api/promotion/provework/promoID.json.js init");
  try {
    let {
      authorization
    } = req.headers;

    let {
      promoID
    } = req.params; 

    let {
      CLOUTCAST_API_URL, CLOUTCAST_API_KEY
    } = process.env;


    console.log("checking auth header");
    if (!authorization) {
      res.statusCode = 401;
      return res.end("No.");
    }

    let tokenSplit = authorization.split(" ");
    if (tokenSplit.length < 1 || tokenSplit[0] !== 'Bearer') {
      res.statusCode = 401;
      return res.end("No.");
    }

    console.log("verifying jwt signature");
    let verifiedTokenData = await verifyToken(tokenSplit[1]);

    // console.log(verifiedTokenData);

    // verify user is in token 
    console.log("verifying key in token");
    if (typeof(verifiedTokenData["PublicKey"]) !== 'string') {
      res.statusCode = 403;
      return res.end("Not a verified user.");
    }
    console.log("attempting pow...");
    await postPOW(promoID, tokenSplit[1]);
    return res.end("OK");



  } catch (ex) {
    let newError = ex;
    if (ex instanceof Error) {
      
      
      let {response: resp = {}} = ex;
      let {data: exData = {}} = resp;
      let {error: exEr = {}} = exData;
      let {reasons = [], message = ""} = exEr;
      console.log(exData);
      if (reasons.length > 0 || message !== "") {
          let errorMessage = `Error(s): ${reasons.join("...")}`;
          errorMessage += ` ${message}`;
          newError = new Error(errorMessage);
          res.statusText = errorMessage;
      } else {
        res.statusText = ex.message || "Unspecified Error";
      }
    } 
    // console.error(ex);
    console.error(newError);
    return next(newError);
  }
}


export async function options(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", req.get('origin'));
  res.setHeader("Access-Control-Allow-Headers", '*');
  res.end();
}