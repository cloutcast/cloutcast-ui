import axios from "axios";
import { verifyReq } from "../../common";

export async function get(req, res, next) {
  try {
    let tUser = null;
    let tToken = null;

    try {
      let tt = await verifyReq(req, true);
      tUser = tt[0];
      tToken = tt[1];
    } catch (ex) {
      res.statusCode = 401;
      return res.end("No.");
    }

    const { CLOUTCAST_API_URL, CLOUTCAST_API_KEY } = process.env;

    let tURL = `${CLOUTCAST_API_URL}/User/inbox`;
    console.log(tURL);
    let myReq = await axios.get(tURL, {
      headers: {
        "Authorization": `Bearer ${tToken}`,
        'x-api-key' : CLOUTCAST_API_KEY
      }
    });

    return res.end(JSON.stringify(myReq.data));

  } catch (ex) {
    return next(ex);
  }
}

export async function post(req, res, next) {
  try {
    let tUser = null;
    let tToken = null;

    try {
      let tt = await verifyReq(req, true);
      tUser = tt[0];
      tToken = tt[1];
    } catch (ex) {
      res.statusCode = 401;
      return res.end("No.");
    }

    const { CLOUTCAST_API_URL, CLOUTCAST_API_KEY } = process.env;

    
    let {body} = req;
   
    let {CoinPriceBitCloutNanos = 0, followerCount = 0} = body;

    console.log([CoinPriceBitCloutNanos, followerCount]);
    let tURL = `${CLOUTCAST_API_URL}/promotions/Active/${CoinPriceBitCloutNanos}/${followerCount}`;
    console.log(tURL);
    let myReq = await axios.get(tURL, {
      headers: {
        "Authorization": `Bearer ${tToken}`,
        'x-api-key' : CLOUTCAST_API_KEY
      }
    });

    return res.end(JSON.stringify(myReq.data));

  } catch (ex) {
    return next(ex);
  }
}


export async function options(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", req.get('origin'));
  res.setHeader("Access-Control-Allow-Headers", '*');
  res.end();
}