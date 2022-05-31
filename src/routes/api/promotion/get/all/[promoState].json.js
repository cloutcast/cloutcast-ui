import axios from 'axios';
import e from 'express';
import moment from 'moment';
import {xRate, TargetActionEnum, inOtherFiat, TargetActionEnumReverse, nanosToBitClout, postWithData} from '../../../../bitclout/common';
import jwt from 'jsonwebtoken';



export async function get(req, res, next) {
  let allGigs = [];
  async function doIterativeWork(promo, bitCloutInUSD, userKey = null) {
    let tPromo = {};
    // console.log(promo);
    let {
      header = {},
      criteria = {},
      target = {},
      client = {},
      events = [],
      inbox = []
    } = promo;
    if (!promo.header.rate) {
      throw new Error("No rate in req");
    }

    let theExpiry = moment().add(header.duration, 'minutes');
    let countOfEngagements = 0;

    tPromo.isDoneAlready = false;
    for (var ev of events) {
      if (ev.action == "UserDidPromotion") {
        // console.log("count!");
        countOfEngagements++;
        // console.log(ev);
        let {user = {}} = ev;
        let {publicKey} = user;
        if (publicKey == userKey) {
          console.log("its done already " + promo.id);
          tPromo.isDoneAlready = true;
        } 
      }
      if (ev.action == "PromotionExpire") {
        theExpiry = ev.timeStamp;
      }
    }

    // do inbox
    let InboxData = [];
    for (var inb of inbox) {
      let {
        user = null,
        readOn = null
      } = inb;

      if (user !== null) {
        let {publicKey: pKey = null} = user;
        if (pKey !== null) {
          InboxData.push({
            publicKey: pKey,
            read: readOn == null ? false : true 
          });
        }
      }
    }


    // let promoPostText = target.post || "{}";
    if (`${target.hex}`.length !== 64) {
      throw new Error("public key not 64: " + target.hex)
    }
    // let promoPostReq = await axios.get(`http://localhost:3000/bitclout/post/${target.hex}.json`, {
    
    
    let {CLOUTCAST_UI_URI} = process.env;

    // let ppR = postWithData(target.hex);
    let promoPostReq = await axios(`${CLOUTCAST_UI_URI}/bitclout/post/${target.hex}.json`, {
      headers: {
        "ExchangeRate": bitCloutInUSD
      }
    });
    let promoPost = promoPostReq.data;
    
    // console.log(promoPost);

    let {RecloutedPostEntryResponse = null} = promoPost.PostFound;
    // console.log(promoPost)
    let isReclout = false;

    if (RecloutedPostEntryResponse) {
      // we have a reclout!

      if (promoPost.PostFound.Body == "") {
        isReclout = true;
        // throw new Error("You're trying to use a reclout post. Please only use the original post, a comment, or a quoted reclout.");
      }

      // we have a quote
      let recloutPostExtra = promoPost.PostFound.PostExtraData || null;
      let recloutVideo = recloutPostExtra.EmbedVideoURL || undefined;
      tPromo.recloutedPost = {
        gigPost: RecloutedPostEntryResponse.Body,
        BitcloutPublicKey: RecloutedPostEntryResponse.ProfileEntryResponse.PublicKeyBase58Check,
        BitcloutUsername: RecloutedPostEntryResponse.ProfileEntryResponse.Username,
        BitCloutUserPrice: inOtherFiat(nanosToBitClout(RecloutedPostEntryResponse.ProfileEntryResponse.CoinPriceBitCloutNanos), bitCloutInUSD),
        img: RecloutedPostEntryResponse.ProfileEntryResponse.ProfilePic,
        gigPostImages: RecloutedPostEntryResponse.ImageURLs || [],
        postVideo: recloutVideo
      }
    }

    let postExtra = promoPost.PostFound.PostExtraData || null;
    let postVideo = postExtra.EmbedVideoURL || null;
    
    tPromo.Rate = inOtherFiat(nanosToBitClout(header.rate), bitCloutInUSD);
    tPromo.RateNanos = header.rate;
    // console.dir(promo);

    let tDone = Math.round(countOfEngagements * (header.rate + header.fee));
    let tRemaining = ((header.rate + header.fee) * header.engagements) - tDone;
    // console.log([tRemaining, tDone, countOfEngagements, header.budget, header.fee, header.engagements])
    tPromo.RemainingBudget = inOtherFiat(nanosToBitClout(tRemaining), bitCloutInUSD);
    tPromo.Duration = header.duration;
    tPromo.Timeout = theExpiry;
    tPromo.BitcloutPublicKey = promoPost.PostFound.ProfileEntryResponse.PublicKeyBase58Check;
    tPromo.BitcloutUsername = promoPost.PostFound.ProfileEntryResponse.Username;
    tPromo.BitCloutUserPrice = inOtherFiat(nanosToBitClout(promoPost.PostFound.ProfileEntryResponse.CoinPriceBitCloutNanos), bitCloutInUSD);
    tPromo.MinCoinPrice = inOtherFiat(nanosToBitClout(criteria.minCoinPrice), bitCloutInUSD);
    tPromo.MinCoinPriceNanos = criteria.minCoinPrice;
    tPromo.MinFollowerCount = criteria.minFollowerCount;
    tPromo.AllowedUsers = criteria.allowedUsers || [];
    tPromo.ForMe = false;
    tPromo.HODLRs = false;
    tPromo.TargetAction = TargetActionEnumReverse[target.action];
    tPromo.TargetActionText = target.action;
    tPromo.gigPost = promoPost.PostFound.Body;
    tPromo.gigPostHash = promoPost.PostFound.PostHashHex;
    tPromo.img = promoPost.PostFound.ProfileEntryResponse.ProfilePic;
    tPromo.Id = promo.id;
    tPromo.gigPostImages = promoPost.PostFound.ImageURLs || [];
    tPromo.postVideo = postVideo;
    tPromo.events = events;
    tPromo.InboxData = InboxData;
    
    if (tRemaining < header.rate) {
      // below, or not enough for txn fee
      // console.log([tPromo.RemainingBudget, tPromo.Id]);
      return;
    } else {
      if (isReclout == false) {
        allGigs.push(tPromo);
      }
      return;      
    }
  }

  try {
    // console.log(req.headers);
    let {
      authorization = null,
      Authorization = authorization,
      getRaw = false
    } = req.headers;

    let {
      promoState
    } = req.params;

    const {
      CLOUTCAST_API_URL,CLOUTCAST_API_KEY, CLOUTCAST_UI_URI
    } = process.env;

    let configBlock = {
      headers: {
        "x-api-key" : CLOUTCAST_API_KEY
      }
    }

    let theKey = null;
    if (Authorization !== null) {
      configBlock.headers.Authorization = Authorization;
      let currentUser = jwt.decode(Authorization.split(" ")[1]);
      let {PublicKey = null} = currentUser;
      if (PublicKey !== null) { 
        // console.log(publicKey + "!!!");
        theKey = PublicKey;
      }
    }
    let promoReq = await axios.get(`${CLOUTCAST_API_URL}/promotions/${promoState}`, configBlock);
    let promoData = promoReq.data;
    if (getRaw) {
      res.end(JSON.stringify(promoData));
    } else {
      let xR = await xRate();

      let {bitCloutInUSD} = xR;

      // do frontpage processing 
      

      if (typeof(promoData.data) !== 'undefined') {
        let allPromos = promoData.data;
        if (Array.isArray(allPromos)) {

          let doPromiseArray = [];
          
          for (var promo of allPromos) {
            doPromiseArray.push(
              doIterativeWork(promo, bitCloutInUSD, theKey)
            );  
          }
          await Promise.all(doPromiseArray);
        }
      }
      // console.dir(allGigs);
      return res.end(JSON.stringify(allGigs.reverse()));
    }

  } catch (ex) {
    console.error(ex);
    let {response = {data: {error: {}}}} = ex;
    console.dir(response.data.error || null);
    // console.log(JSON.stringify(ex, null, 4));
    return next(ex);
  }
}

export async function options(req, res, next) {
  //Access-Control-Allow-Credentials
  res.setHeader("Access-Control-Allow-Credentials", 'true');
  res.setHeader("Access-Control-Allow-Origin", req.get('origin'));
  res.setHeader("Access-Control-Allow-Headers", '*');
  res.end();
}