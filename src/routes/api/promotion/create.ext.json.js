import axios from "axios";
import { verifyReq } from "./../common";
import {xRate, nanosToBitClout, bitCloutToNanos} from "./../../bitclout/common";

export const schemaRef = {
 "Rate" : "rate",
 "Engagement Type" : "action",
 "Total" : "budget",
 "Minimum Follower Count": "minFollowerCount",
 "Minimum Coin Price" : "minCoinPrice",
 "Duration (Minutes)" : "duration",
 "Clout URI" : "cloutUri",
 "bitcloutXRate" : "bitcloutXRate",
 "Exclusive Promo Users" : "allowedUsersObjects",
 "Total Potential Promoters" : "totalPromoters"
};

export async function post(req, res, next) {
    
  try {

    let xR = await xRate();

    let {CLOUTCAST_API_URL, CLOUTCAST_API_KEY} = process.env;

    
    
    let tokenData = null;
    let userToken = null;
    try {
      let tT = await verifyReq(req, true);
      userToken = tT[1];
      tokenData = tT[0];


    } catch (ex) {
      res.statusCode = 401; 
      return res.end("oh 401");
    }

    let {
      body, params, headers
    } = req;

    let userKey = tokenData["PublicKey"] || null;
    console.log([userKey, tokenData])

    if (!userKey) {
      res.statusCode = 401;
      return res.end("401");
    }

    
    await axios.post(`${CLOUTCAST_API_URL}/Promotion/create`, body, {
      headers: {
        authorization: `Bearer ${userToken}`,
        "x-api-key": CLOUTCAST_API_KEY
      }
    });

    return res.json({message: "OK!"});


  } catch(ex) {
    console.error(ex);
    let {response = {}} = ex;
    let {statusText = null, status, data: exData = {}} = response; 
    let {error: exEr = {}} = exData;
    console.log(exEr);
    let {reasons = [], message = ""} = exEr;

    let errMessage = statusText;
    if (reasons.length > 0 || message !== "") {
      errMessage = `Error(s): ${reasons.join("...")}`;
      errMessage += ` ${message}`;
    }

    if (statusText !== null) {
      res.statusCode = 500;
      return res.end(errMessage);
    } else {
      return next(ex);  
    }
  }
}


export async function options(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", req.get('origin'));
  res.setHeader("Access-Control-Allow-Headers", '*');
  res.end();
}