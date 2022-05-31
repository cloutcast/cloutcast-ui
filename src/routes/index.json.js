import * as faker from 'faker';

import axios from 'axios';

import {xRate, TargetActionEnum} from './bitclout/common';

import demoFeed from "../demo/demoFeed";

import moment from 'moment';

async function getFakeData(numGigs) {
  let allGigs = [];
  let xR = await xRate();
  let {bitCloutInUSD} = xR;
  let postDate = moment('2021-04-26T00:00:00Z');
  

  for (var g of demoFeed) {
    let postDate = moment('2021-04-26T00:00:00Z');
    let endDate = postDate.add(g.duration.minutes, 'minutes');
    let remainingTime = endDate.diff(moment(), 'minutes');
    let gig = {
      Rate: (Math.round(100 * (g.rate * bitCloutInUSD))/100),
      RemainingBudget: Math.round(100 * (parseFloat(g.budget) * bitCloutInUSD)/100),
      Duration: remainingTime + 5760,
      BitcloutUsername: g.targetPostJSON.PostFound.ProfileEntryResponse.Username,
      BitCloutUserPrice: Math.round(100*(g.targetPostJSON.PostFound.ProfileEntryResponse.CoinPriceBitCloutNanos * 0.000000001) * bitCloutInUSD)/100,
      MinCoinPrice: g.targetPostJSON.criteria.minCoinPrice,
      MinFollowerCount: g.targetPostJSON.criteria.minFollowerCount,
      ForMe: false,
      HODLRs: false,
      TargetAction: g.targetPostJSON.targetAction,
      TargetActionText: TargetActionEnum[g.targetPostJSON.targetAction] || 0,
      gigPost: g.targetPostJSON.PostFound.Body,
      gigPostHash: g.targetPostJSON.PostFound.PostHashHex,
      img: g.targetPostJSON.PostFound.ProfileEntryResponse.ProfilePic,
      Id: g.id,
      gigPostImages: g.targetPostJSON.PostFound.ImageURLs
    }
    allGigs.push(gig);
  };

  // for (var i=0; i < numGigs; i++ ){
  //   let doPrice = faker.datatype.boolean();

  //   let MinCoinPrice = null;
  //   let MinFollowerCount = null;
  //   if (doPrice) {
  //     MinCoinPrice = faker.datatype.float({min: 20, max: 600, precision: 0.01});
  //   } else {
  //     MinFollowerCount = faker.datatype.number({min: 10, max: 500});
  //   }
  //   let gig = {
  //     Rate: Math.round(100*bitCloutInUSD * faker.datatype.float({min: 0.009, max: 1, precision: 0.001}))/100,
  //     RemainingBudget: faker.datatype.float({min: 0.01, max: 20, precision: 0.001}),
  //     Duration: faker.datatype.number({min: 60, max: 270, precision: 1}),
  //     BitcloutUsername: faker.internet.userName(),
  //     BitCloutUserPrice: faker.datatype.float({min: 1, max: 10000, precision: 0.01}),
  //     MinCoinPrice, 
  //     MinFollowerCount,
  //     ForMe: faker.datatype.boolean(),
  //     HODLRs: faker.datatype.boolean(),
  //     gigPost: faker.lorem.sentence(15, 50),
  //     img: faker.image.avatar(),
  //     TargetAction: faker.datatype.number({min: 10, max: 30, precision: 10}),
  //     Id: i+1
  //   }
  //   allGigs.push(gig);
  // }

  return allGigs;
}

export async function get(req, res, next) {

  try {
    let fakeData = await getFakeData(10);
    
    res.end(JSON.stringify(fakeData));
  } catch (ex) {
    return next(ex);
  }
  
}