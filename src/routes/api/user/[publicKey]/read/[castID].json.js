// import { newDBConnection } from "../../../bitclout/common";

import axios from "axios";

import { verifyReq } from "../../../common";

export async function get(req, res, next) {
  try {
    let tokenData = null;
    let userToken = null;
    try {
      let tT = await verifyReq(req, true);
      userToken = tT[1];
      tokenData = tT[0];


    } catch (ex) {
      console.error(ex);
      res.statusCode = 401; 
      return res.end("oh 401");
    }

    console.log(req.params);
    let {publicKey = null, castID = null} = req.params;

    if (publicKey == null) {
      res.statusCode = 400;
      return res.end({error: "bad public key."})
    } else if (castID == null) {
      res.statusCode = 400;
      return res.end({
        error: 'bad castID'
      });
    } else {
      let {CLOUTCAST_API_URL, CLOUTCAST_API_KEY} = process.env;

      let notificationReq = await axios.get(`${CLOUTCAST_API_URL}/User/inbox/read/${castID}`, {
        headers: {
          'Authorization' : `Bearer ${userToken}`,
          'x-api-key' : CLOUTCAST_API_KEY,
          'accept' : 'application/json'
        }
      });

      let statusCode = notificationReq.status;

      if (statusCode == 200) {
        return res.json({
          success: true
        });
      } else {
        res.statusCode = 400;
        return res.json({
          error: true,
          message: "error reading"
        });
      }

      
    }
  } catch (ex) {
    console.error(ex);
    return res.json({
      error: true, 
      message: 'error: ' + (ex.message || 'Unspecified Error')
    });
  } 
}

export async function options(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", req.get('origin'));
  res.setHeader("Access-Control-Allow-Headers", '*');
  res.end();
}