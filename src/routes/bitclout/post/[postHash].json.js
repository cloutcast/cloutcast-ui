import { BlobServiceClient } from '@azure/storage-blob';
import axios from 'axios';
import {postPost, xRate} from './../common.js';

async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data.toString());
    });
    readableStream.on("end", () => {
      resolve(chunks.join(""));
    });
    readableStream.on("error", reject);
  });
}

export async function get(req, res, next) {
  try {
    let {AZURE_BLOB_STRING} = process.env;
    let {postHash = ''} = req.params;

    let {exchangerate: ExchangeRate = ""} = req.headers;
    // console.log(req.headers);

    const blobClient = BlobServiceClient.fromConnectionString(AZURE_BLOB_STRING);

    const containerClient = blobClient.getContainerClient("cloutcast");

    const blockClient = containerClient.getBlockBlobClient(`${postHash}.json`);

    let theBlob = null;
    try {
      let tRead = await blockClient.download(0);
      let tString = await streamToString(tRead.readableStreamBody);
      theBlob = JSON.parse(tString);

    } catch (ex) {
      console.warn("error getting blob");
      console.error(ex);
    }

    if (theBlob !== null) {
      console.log("using the blob!");
      let xR = null;
      if (ExchangeRate == "") {
        console.log("getting xrate");
        xR = await xRate();
        console.log(xR.bitCloutInUSD)
      } else {
        xR = {
          bitCloutInUSD: parseFloat(ExchangeRate)
        } 
      }

      let bitcloutPrice = Math.round(100*(theBlob.PostFound.ProfileEntryResponse.CoinPriceBitCloutNanos * 0.000000001) * xR.bitCloutInUSD)/100;

      theBlob.PostFound.ProfileEntryResponse.bitcloutPrice = bitcloutPrice;

      
      
      return res.end(JSON.stringify({
        ...theBlob,
        posterUSDPrice: bitcloutPrice
      }));

    } else {
      let data = {
        "PostHashHex": postHash,
        "ReaderPublicKeyBase58Check" : "BC1YLgQfRv7rpS4qo1jmS8aLq1a8wSE2VenGzHFG9zRyd6Eu5Y8jjca",
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
  
      
      console.log("getting post");
      let postRes = await axios(aConfig);
  
      let rez = postRes.data; 

      try {
        let tData = JSON.stringify(rez);

        let writeBlobResponse = await blockClient.upload(tData, tData.length);
        console.log("success");

      } catch (ex) {
        console.warn("could not write block");
        console.error(ex);
      }




      let bitcloutPrice = null;
      if (typeof(rez.PostFound) !== 'undefined') {
        if (typeof(rez.PostFound.ProfileEntryResponse) !== 'undefined') {
          let xR = null;
          if (ExchangeRate == "") {
            console.log("getting xrate");
            xR = await xRate();
            console.log(xR.bitCloutInUSD)
          } else {
            xR = {
              bitCloutInUSD: parseFloat(ExchangeRate)
            } 
          }

          let bitcloutPrice = Math.round(100*(rez.PostFound.ProfileEntryResponse.CoinPriceBitCloutNanos * 0.000000001) * xR.bitCloutInUSD)/100;

          
          
          rez.PostFound.ProfileEntryResponse.bitcloutPrice = bitcloutPrice;
        }
      }
  
      
      return res.end(JSON.stringify({
        ...rez,
        posterUSDPrice: bitcloutPrice
      }));
    }


    
  } catch (ex) {
    // console.error(ex);
    return next(ex);
  }
};