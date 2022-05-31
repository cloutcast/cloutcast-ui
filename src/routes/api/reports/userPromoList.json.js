import axios from "axios";
import {verifyReq} from "../common";

export async function get(req, res, next) {
  const {
    CLOUTCAST_API_URL, CLOUTCAST_API_KEY
  } = process.env;
  
  try {

    let tToken = null;
    let tUser = null;

    try {
      let t = await verifyReq(req, true);
      tUser = t[0];
      tToken = t[1];
    } catch (ex) {
      console.error(ex);
      res.statusCode = 401;
      return res.end("No.");
    }

    if (tToken == null || tUser == null) {
      res.statusCode = 401;
      return res.end("No!");
    }

    // 

    let tPromos = await axios.get(`${CLOUTCAST_API_URL}/promotions/client/${tUser.PublicKey}/Both`, {
      headers: {
        'x-api-key' : CLOUTCAST_API_KEY, 
        'authorization' : `Bearer ${tToken}`
      }
    });


    // console.dir(tUser);
    let {data} = tPromos.data;

    let allPromos = [];
    for (var item of data) {
      let timeStart = null;
      let countEngagements = 0;
      for (var event of item.events || []) {
        if (event.action == "PromotionStart") {
          timeStart = event.timeStamp;
        }

        if (event.action == "UserDidPromotion") {
          countEngagements++
        }
      }
      allPromos.push({
        timeStart,
        countEngagements,
        ...item
      });
    }

    return res.end(
      JSON.stringify(allPromos)
    );


  } catch (ex) {
    console.error(ex); 
    res.statusCode = 500;
    let {response = {}} = ex;
    let {data = {}} = response; 
    let {error} = data;
    res.end(JSON.stringify(error || {success: false, stack: ex.stack || null, message: ex.message || null}));
  }
  
}