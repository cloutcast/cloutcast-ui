import axios from "axios";
import { verifyReq } from "../../../common";



export async function get(req, res, next) {

  const {
    CLOUTCAST_API_URL,
    CLOUTCAST_API_KEY
  } = process.env;

  let {nanos} = req.params;


  try {
    if (!nanos) {
      throw new Error("come on...");
    }
    let tUser = null;
    let tToken = null;
    try {
      let userParts = await verifyReq(req, true);
      tUser = userParts[0];
      tToken = userParts[1];
    } catch (ex) {
      res.statusCode = 401;
      return res.end("No.")
    }

    if (tUser == null || tToken == null) {
      res.statusCode = 401;
      return res.end("No.");
    }
    
    let withdrawPost = await axios.get(`${CLOUTCAST_API_URL}/GeneralLedger/${tUser['Id']}/withdraw/${nanos}`, {
      headers: {
        Authorization: `Bearer ${tToken}`,
        'x-api-key' : CLOUTCAST_API_KEY
      }
    });
    console.log(withdrawPost.status);
    if (withdrawPost.status == 200) {
      return res.end("OK");
    } else {
      res.statusCode = withdrawPost.status;
      return res.end(withdrawPost.statusText);
    }

  } catch(ex) {
    return next(ex);
  }
}

export async function options(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", req.get('origin'));
  res.setHeader("Access-Control-Allow-Headers", '*');
  res.end();
}