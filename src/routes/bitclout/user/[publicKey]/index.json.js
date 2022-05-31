import axios from 'axios';

import {getProfile, newDBConnection} from "./../../common.js";

export async function get(req, res, next) {
  try {
    let { publicKey = '' } = req.params;
    let { usersub } = req.headers;
    
    if (!!!usersub) {
      return next(new Error("No userID (sub)"));
    }

    if (!publicKey) {
      return next(new Error("No publicKey"));
    }

    console.log(req.headers);
    if (`${publicKey}`.length !== 55) {
      throw new Error("invalid public key");
    }

    let axiosBaseConfig = getProfile(publicKey);


    let rez = await axios(axiosBaseConfig);

    let tData = rez.data; 
    let {Profile = null} = tData;
    if (Profile !== null) {
      const db = newDBConnection();

      console.log("getting previous verifications");
      let previousVerify = await db
        .select("UniqueId")
        .from("UserVerification")
        .where("UniqueId", usersub)
        .orWhere("PublicKey", publicKey);
      
      console.log("is user verified");
      let existingUser = await db.select("Id").from("BitCloutUser").where("PublicKey", publicKey);

      let foundUser = null;
      for (var u of existingUser) {
        let {Handle = null} = u;
        let HandleRegex = /UnVerified .*/
        if (Handle == null || HandleRegex.test(Handle)) {
          // pass. 
        } else {
          foundUser = u;
        }
      }

      if (foundUser !== null) {
        throw new Error("found a user already...");
      }
      

      let previousAttemptData = null;

      
      if (previousVerify.length) {
        previousAttemptData = previousVerify[0];
      }
      

      res.end(JSON.stringify({...Profile, previousAttemptData}));
    }



  } catch (ex) {
    console.error(ex);
    return next(ex);
  }

}