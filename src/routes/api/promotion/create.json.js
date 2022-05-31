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

    if (!Array.isArray(body)) {
      res.statusCode = 400;
      return res.end("400");
    }

    let tTemp = {
      budget            : 0,
      duration          : 0,
      rate              : 0,
      minCoinPrice      : 0,
      minFollowerCount  : 0,
      allowedUsers      : [],
      allowedUsersObjects: [],
      action            : "",
      cloutUri          : "",
      cloutHex          : "",
      bitcloutXRate     : 0,
      totalPromoters    : 0,
    }




    // assign sub blocks 
    for (var rItem of body) {
      // let rKey = rItem.key;

      for (var i in Object.keys(schemaRef) ) {
        let t = Object.keys(schemaRef)[i];
        if (t == rItem.key) {
          let v = Object.values(schemaRef)[i];
          tTemp[v] = rItem.value;
        }
      }
      
    }


    let almostCloutUri = tTemp.cloutUri.split("/");
    tTemp.cloutHex = almostCloutUri[almostCloutUri.length - 1].substr(0, 64);
    // let almostCloutUri = tTemp.cloutUri.replace("https://bitclout.com/posts/","");
    // tTemp.cloutHex = almostCloutUri.substr(0,64);

    if (tTemp.cloutHex.length !== 64) {
      throw new Error("invalid post hex.");
    }

    if (tTemp.totalPromoters == 0 || tTemp.duration == 0 || tTemp.rate == 0 || tTemp.action == '' || tTemp.bitcloutXRate == 0) {
      console.error(tTemp);
      throw new Error("syntax error. contact admin@cloutcast.io");
    }
    let criteria = {};
    // construct outbound payload 
    if (tTemp.allowedUsersObjects.length > 0) {
      for (var allowedU of tTemp.allowedUsersObjects) {
        // console.log(allowedU);
        if (typeof(allowedU.PublicKeyBase58Check) == 'string') {
          tTemp.allowedUsers.push(allowedU.PublicKeyBase58Check);
        }
      }
      criteria.allowedUsers = tTemp.allowedUsers;
    } else {
      criteria.minCoinPrice = Math.floor(Math.round(100000 * bitCloutToNanos(tTemp.minCoinPrice)) / 100000);
      criteria.minFollowerCount = tTemp.minFollowerCount
    }
    let aRate = Math.floor(bitCloutToNanos(tTemp.rate));
    let outRate = Math.round(aRate * 1.12);
    let outBudget = (outRate *  tTemp.totalPromoters);
    let tOut = {
      header: {
        engagements: tTemp.totalPromoters,
        duration: tTemp.duration,
        rate: aRate,
        fee: 1,
        bitCloutToUsdRate: tTemp.bitcloutXRate
      },
      criteria,
      target: {
        action: tTemp.action,
        hex: tTemp.cloutHex
      }
    };

    console.dir(tOut);
    await axios.post(`${CLOUTCAST_API_URL}/Promotion/create`, tOut, {
      headers: {
        authorization: `Bearer ${userToken}`,
        "x-api-key": CLOUTCAST_API_KEY
      }
    });

    // console.log(criteria);
    
    // return res.end("K");
  
    return res.end("OK");



    

    // console.dir(tTemp);
    

    

    
    
    // console`.dir({body, params, headers});

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