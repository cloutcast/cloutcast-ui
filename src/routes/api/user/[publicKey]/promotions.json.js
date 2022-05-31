import axios from "axios";
import { verifyReq } from "../../common";

export async function get(req, res, next) {
  let {CLOUTCAST_API_URL, CLOUTCAST_API_KEY} = process.env;

  try {
    let token = null;
    let decoded = null;
    try {
      let tToken = await verifyReq(req, true);
      token = tToken[1];
      decoded = tToken[0];
    } catch (ex) {
      res.statusCode = 401;
      return res.end("No.");
    }

    if (token == null || decoded == null) {
      console.log("no token.");
      res.statusCode = 401;
      return res.end('No.');
    }


    let bitCloutKey = decoded["PublicKey"];
    let baseURL = `${CLOUTCAST_API_URL}/promotions/client/${bitCloutKey}`;
    let baseAxiosConfig = {headers: {Authorization: `Bearer ${token}`, 'x-api-key' : CLOUTCAST_API_KEY}};
    let bothReqs = await Promise.all([
      await axios.get(`${baseURL}/Active`, baseAxiosConfig),
      await axios.get(`${baseURL}/Inactive`, baseAxiosConfig)
    ]);
    
    let active = bothReqs[0].data;
    let inactive = bothReqs[1].data;
    let tOut = {
      active, inactive
    };


    return res.end(JSON.stringify(tOut));

  } catch (ex) { return next(ex); }
}