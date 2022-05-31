import axios from "axios";
import { verifyReq } from "../../../common";

export async function get(req, res, next){ 
  try {
  const {CLOUTCAST_API_URL, CLOUTCAST_API_KEY} = process.env;
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

  let {promoID} = req.params;


  let promoData = await axios.get(`${CLOUTCAST_API_URL}/Promotion/${promoID}`, {
    headers: {
      "Authorization": `Bearer ${tToken}`,
      'x-api-key' : CLOUTCAST_API_KEY
    }
  });

  return res.end(JSON.stringify(promoData.data));

  
  } catch (ex) {
    console.error(ex);
    return next(ex);
  }

}