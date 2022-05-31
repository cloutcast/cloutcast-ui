import axios from "axios";
import moment from "moment";
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

    let walletGet = await axios.get(`${CLOUTCAST_API_URL}/User/ledger/${dToken['Id']}`, {headers: {
      Authorization: `Bearer ${token}`,
      'x-api-key' : CLOUTCAST_API_KEY
    }});


    let wallet = walletGet.data;

    let {data: walletData = []} = wallet;

    let walletOut = [];

    let rightNow = moment().unix();
    console.dir(walletData);
    for (var entry of walletData) {
      let isFuture;
      let entryDate = entry.entityLog.timeStamp;
      let mTime = moment(entryDate).unix();
      if (mTime > rightNow) {
        isFuture = true;
      } else {
        isFuture = false;
      }

      walletOut.push({
        ...entry,
        isFuture
      });
      
    }

    walletOut.sort((a,b) => {
      a.entityLog.timeStamp > b.entityLog.timeStamp ? 1 : -1;
    })

    walletOut.reverse();
    console.log(walletOut);

    return res.end(JSON.stringify({data: walletOut}));

  } catch (ex) {
    console.error(ex);
    return next(ex);
  }
}