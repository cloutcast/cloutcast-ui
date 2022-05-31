import {verifyReq} from "../../common";

import axios from 'axios';


export async function get(req, res, next) {
  try {
    let decodedToken = null;
    try {
      decodedToken = await verifyReq(req, true);
    } catch (ex) {
      console.error(ex);
    }
    if (!!!decodedToken) {
      res.statusCode = 401;
      return res.end("no.");
    }

    const {CLOUTCAST_API_URL, CLOUTCAST_API_KEY} = process.env;

    let userPublicKey = decodedToken["PublicKey"];
    
    let getUser = await axios.get(`${CLOUTCAST_API_URL}/User/publicKey/${userPublicKey}`, {
      headers: {
        authorization: req.headers.authorization,
        'x-api-key' : CLOUTCAST_API_KEY
      }
    });
    let userJSON = getUser.data;

    console.log(userJSON);

    res.end("OK");

  } catch (ex) {
    // console.error(ex);
    return next(ex);
  }
}