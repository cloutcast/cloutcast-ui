import axios from "axios";
import { verifyReq } from "../../common";


export async function get(req, res, next) {
  const { CLOUTCAST_API_URL, CLOUTCAST_API_KEY } = process.env;

  try {
    let dToken = null;
    let token = null;
    try {
      let tokenData = await verifyReq(req, true);
      dToken = tokenData[0];
      token = tokenData[1];
    } catch (ex) {
      console.error(ex);
      res.statusCode = 401;
      return res.end("No.");
    }

    if (!!!dToken || !!!token) {
      res.statusCode = 403;
      return res.end("No.");
    }

    let walletGet = await axios.get(`${CLOUTCAST_API_URL}/User/balance/${dToken['Id']}`, {headers: {
      Authorization: `Bearer ${token}`,
      'x-api-key' : CLOUTCAST_API_KEY
    }});


    let wallet = walletGet.data;

    return res.end(JSON.stringify(wallet));

  } catch (ex) {
    console.error(ex);
    return next(ex);
  }
}

export async function options(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", req.get('origin'));
  res.setHeader("Access-Control-Allow-Headers", '*');
  res.end();
}