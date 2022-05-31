import axios from "axios";
import { verifyReq } from "./../../common";


export async function get(req, res, next) {
  try {
    const {CLOUTCAST_API_URL, CLOUTCAST_API_KEY} = process.env;

    let tToken = null;
    let tUser = null;

    try {
      let verifyParts = await verifyReq(req, true);
      tUser = verifyParts[0];
      tToken = verifyParts[1];

    } catch (ex) {
      console.error(ex);
      res.statusCode = 401;
      return res.end("No.");
    }

    let {promo} = req.params;

    if (tToken == null || tUser == null) {
      res.statusCode = 401;
      // console.log([tToken, tUser]);
      return res.end("No!");
    }

    await axios.post(`${CLOUTCAST_API_URL}/Promotion/stop/${promo}`,{}, {
      headers: {
        Authorization: `Bearer ${tToken}`,
        'x-api-key' : CLOUTCAST_API_KEY
      }
    });

    // console.log(promo);
    
    return res.end("OK");


  } catch (ex) { return next(ex); }
}