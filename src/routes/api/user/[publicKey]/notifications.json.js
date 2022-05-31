// import { newDBConnection } from "../../../bitclout/common";

import axios from "axios";

export async function get(req, res, next) {
  try {
  console.log(req.params);
  let {publicKey = null} = req.params;

  if (publicKey == null) {
    res.statusCode = 400;
    return res.end({error: "bad public key."})
  } else {
    
    let {CLOUTCAST_API_URL, CLOUTCAST_API_KEY} = process.env;

    let notificationReq = await axios.get(`${CLOUTCAST_API_URL}/User/inbox/count/${publicKey}`, {
      headers: {
        'x-api-key' : CLOUTCAST_API_KEY,
        'accept' : 'text/plain'
      }
    });

    return res.json({notificationCount: notificationReq.data});
  }
  } catch (ex) {
    console.error(ex);
    return res.json({
      error: true, 
      count: 0
    });
  }

  
}