import { newDBConnection } from "../../common.js"
import * as moment from 'moment';
import { v4 } from 'uuid';

import axios from 'axios';

import {postPost, updateAuth0User} from './../../common';
import e from "express";

export async function get(req, res, next) {
  try {
    let {usersub, publickey, posthash} = req.headers;

    const {CLOUTCAST_API_URL, CLOUTCAST_API_KEY} = process.env;

    const db = newDBConnection();
    let verifyRecords = await db
      .select("PassPhrase")
      .from("UserVerification")
      .where("UniqueId", usersub)
      .andWhere("PublicKey", publickey);
    
    if (!verifyRecords.length) {
      throw new Error("No verify record for user.");
    } 

    let verifyRecord = verifyRecords[0];

    let data = {
      "PostHashHex": posthash,
      "ReaderPublicKeyBase58Check":"",
      "FetchParents":true,
      "CommentOffset":0,
      "CommentLimit":20,
      "AddGlobalFeedBool":false
    };

    let postMeta = postPost();

    let aConfig = {
      ...postMeta,
      data
    };

    let rez = await axios(aConfig);

    // console.dir(rez.data);

    let tPost = rez.data; 

    if (typeof(tPost.PostFound) !== 'undefined') {
      let {
        PosterPublicKeyBase58Check,
        Body,
        ProfileEntryResponse
      } = tPost.PostFound;
      let {Username} = ProfileEntryResponse 

      if (!Username) {
        throw new Error("Username isn't in ProfileEntryResponse");
      }

      if (PosterPublicKeyBase58Check == publickey && verifyRecord.PassPhrase == Body) {
        // user is verified. 
        
        console.log("user is verified! inserting user")
        await axios.post(`${CLOUTCAST_API_URL}/User/publicKey/${publickey}`, {}, {
          headers: {
            'x-api-key' : CLOUTCAST_API_KEY
          }
        });

        console.log("Updating auth0")
        await updateAuth0User(usersub, publickey);


        console.log("removing all other userVerifications");
        res.end(JSON.stringify({success:true}));

      } else {
        let textErrors = "";
        if (PosterPublicKeyBase58Check !== publickey) { textErrors += "Post is not yours!  "}
        if (verifyRecord.PassPhrase !== Body) { textErrors += "This post is not a verification post! "}

        let tOut = {
          success: false,
          message: `Error: ${textErrors}`
        }
        res.end(JSON.stringify(tOut));
      }
    } else {
      throw new Error("Post not found.");
    }


  } catch (ex) {
    let newError = ex;
    if (ex instanceof Error) {
      
      
      let {response: resp = {}} = ex
      let {data: exData = {error: {}}} = resp;
      let {reasons = []} = exData.error;
      if (Array.isArray(reasons) && reasons.length > 0) {
          let errorMessage = `Error(s): ${reasons.join("...")}`;
          newError = new Error(errorMessage);
      }
    } 
      // console.error(ex);
      console.error(newError);
      return next(newError);
  }

}

export async function post(req, res, next) {
  try{
  let { publicKey } = req.params;
  let { usersub, cloutusername } = req.headers;

  const db = newDBConnection();
  let previousRun = await db
    .select("PassPhrase")
    .from("UserVerification")
    .where("UniqueId", usersub)
  if (previousRun.length) {
    if (previousRun[0].PublicKey == publicKey) {
    return res.end(JSON.stringify({
      verifyString: previousRun[0].PassPhrase
    }));
    } else {
      await db.delete().from("UserVerification").where("UniqueId", usersub);
    }
  } 
    let theUUID = v4();
    let rightNow = moment().unix();


    const aSecret = `@CloutCast (http://cloutcast.io) verification: ${rightNow}@${theUUID}`;
  
    console.log(`${publicKey} @ ${usersub} verify -- ${aSecret}`);
    await db.transaction(async trx => {
      await trx("UserVerification").insert({
        PublicKey: publicKey, 
        BitCloutHandle: cloutusername,
        UniqueId: usersub,
        PassPhrase: aSecret
      });
    });  
    let tOut = {
      verifyString: aSecret
    };
    res.end(JSON.stringify(tOut));
  
  } catch (ex) {
    let theError = ex;
    if (typeof ex.response !== 'undefined' ) {
      if (typeof ex.response.data !== "undefined") {
        if (typeof ex.data.error !== 'undefined') {
          
          theError = new Error(JSON.stringify(ex.data.error));
          
        }
      }
    }
    console.error(theError);
    return next(theError);
  }



}