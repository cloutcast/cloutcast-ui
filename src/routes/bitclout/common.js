import knex from 'knex';
import axios from 'axios';

let {BITCLOUT_API_URL} = process.env;

export const newDBConnection = function() {
  let {MSSQL_HOST, MSSQL_DB, MSSQL_USER, MSSQL_PASS } = process.env;
  return knex({
    client: 'mssql', 
    connection: {
      host: MSSQL_HOST,
      user: MSSQL_USER,
      password: MSSQL_PASS,
      options: {
        encrypt: true,
        database: MSSQL_DB,
        port: 1433
      }
    }, 
  })
}

export const generateDataBlock = function(publicKey, multiple = false) {
  if (!multiple) {
  return JSON.stringify({
    "PublicKeyBase58Check": publicKey

  });
  } else {
    return JSON.stringify({
      "PublicKeysBase58Check": [publicKey]
    });
  }
};

export const getFollows = function(username) {
  let {BITCLOUT_API_URL} = process.env;

  let data = {"Username":username,"PublicKeyBase58Check":"","GetEntriesFollowingUsername":true,"LastPublicKeyBase58Check":"","NumToFetch":10}
  return {
    method: 'post',
    url: `${BITCLOUT_API_URL}/api/v0/get-follows-stateless`,
    headers: { 
      'Content-Type': 'application/json', 
      'Cache-Control' : 'no-cache'

    },
    data
  };
};

export const getProfile = function(userKey) {
  let {BITCLOUT_API_URL} = process.env;

  let data = {
    "PublicKeyBase58Check": userKey
  }
  return {
    method: 'post',
    url: `${BITCLOUT_API_URL}/api/v0/get-single-profile`,
    headers: { 
      'Content-Type': 'application/json', 
      'Cache-Control' : 'no-cache'

    },
    data
  };
};

export const getProfiles = function(userKey) {
  let {BITCLOUT_API_URL} = process.env;

  let data = {
    "PublicKeyBase58Check": userKey
  }
  return {
    method: 'post',
    url: `${BITCLOUT_API_URL}/api/v0/get-profiles`,
    headers: { 
      'Content-Type': 'application/json', 
      'Cache-Control' : 'no-cache'

    },
    data
  };
};



export const xRateGet = function() { 
  let {BITCLOUT_API_URL} = process.env;

  return {
    method: 'get',
    url: `${BITCLOUT_API_URL}/api/v0/get-exchange-rate`,
    headers: { 
      'Content-Type': 'application/json', 
      'Cache-Control' : 'no-cache'

    }
  };
};

export const postPost = function() { 
  let {BITCLOUT_API_URL} = process.env;

  return {
    method: 'post',
    url: `${BITCLOUT_API_URL}/api/v0/get-single-post`,
    headers: { 
      'Content-Type': 'application/json',
      'Cache-Control' : 'no-cache'
 
    }
  };
};

export const postWithData = function(hashHex, offset = 0) {
  let {BITCLOUT_API_URL} = process.env;

  let data = {
    "PostHashHex":hashHex,
    "ReaderPublicKeyBase58Check":"",
    "FetchParents":true,
    "CommentOffset":offset,
    "CommentLimit":100,
    "AddGlobalFeedBool":false,
    "ReaderPublicKeyBase58Check" : "BC1YLgQfRv7rpS4qo1jmS8aLq1a8wSE2VenGzHFG9zRyd6Eu5Y8jjca" 
  };
  return {
    method: 'post',
    url: `${BITCLOUT_API_URL}/api/v0/get-single-post`,
    headers: { 
      'Content-Type': 'application/json', 
      'Cache-Control' : 'no-cache'

    },
    data
  };
};

export const transactionPost = function() { 
  let {BITCLOUT_V1_API_URL} = process.env;

  return {
    method: 'post',
    url: `${BITCLOUT_V1_API_URL}/api/v1/transaction-info`,
    headers: { 
      'Content-Type': 'application/json', 
      'Cache-Control' : 'no-cache'

    }
  };
};

export const queryUsersPost = function(query) {
  let {BITCLOUT_API_URL} = process.env;

  //
  let userPayload = {"PublicKeyBase58Check":"","Username":"","UsernamePrefix":query,"Description":"","OrderBy":"","NumToFetch":20,"ReaderPublicKeyBase58Check":"","ModerationType":"","FetchUsersThatHODL":false,"AddGlobalFeedBool":false};
  return {
    method: 'post',
    url: `${BITCLOUT_API_URL}/api/v0/get-profiles`,
    headers: { 
      'Content-Type': 'application/json', 
      'Cache-Control' : 'no-cache'

    },
    data: userPayload
  }
};

export const postsForPublicKey = function(publicKey, NumToFetch = 100) {
  let {BITCLOUT_API_URL} = process.env;

  let data = {
    "PublicKeyBase58Check":publicKey,
    "Username":"",
    "ReaderPublicKeyBase58Check":"",
    "LastPostHashHex":"",
    NumToFetch
  }

  return {
    method: 'post',
    url: `${BITCLOUT_API_URL}/api/v0/get-posts-for-public-key`,
    headers: { 
      'Content-Type': 'application/json', 
      'Cache-Control' : 'no-cache'
    },
    data 
  }
};

export const xRate = async function() {
  try {
    // let xRateConfig = xRateGet();
    // let xRateReq = await axios(xRateConfig);
    // let xRateData = xRateReq.data;

    let tickerDataReq = await axios.get("https://api.coinstats.app/public/v1/coins/bitcoin?currency=USD");
    let tickerData = tickerDataReq.data;
    let {coin = {} } = tickerData;
    let {price} = coin; 


    let bitcloutTickerDataReq = await axios.get("https://api.coinstats.app/public/v1/coins/bitclout?currency=USD");
    /*
    {"coin":
      {
        "id":"bitclout",
        "icon":"https://static.coinstats.app/coins/bitcloutg8T.png",
        "name":"BitClout",
        "symbol":"CLOUT",
        "rank":93,
        "price":100.07,
        "priceBtc":0.002064519091849381,
        "volume":179899,
        "marketCap":1053984647,
        "availableSupply":10532253.8854,
        "totalSupply":10808492.6854,"
        priceChange1h":0,
        "priceChange1d":0.1,
        "priceChange1w":-1.51,
        "websiteUrl":"https://bitclout.com/",
        "twitterUrl":"https://twitter.com/Bitclout_",
        "exp":["https://explorer.bitclout.com/","https://explorer.cloutangel.com/"]
      }
    }
    */
    
    let bitcloutData = bitcloutTickerDataReq.data || {};
    let bitcloutCoinData = bitcloutData.coin || {};
    
    // let {USDCentsPerBitcoinExchangeRate, SatoshisPerBitCloutExchangeRate} = xRateData;
    // let bitcloutInBitcoin = SatoshisPerBitCloutExchangeRate * 0.00000001; 
    // let bitcoinPrice = USDCentsPerBitcoinExchangeRate / 100;
    let bitcloutInBitcoin = bitcloutCoinData.priceBtc;
    let bitCloutInUSD = bitcloutCoinData.price;
    let bitCloutInUSDRounded = Math.round(100*(bitCloutInUSD))/100;
    let nanosInUSDRounded = Math.round(10000000000* (bitCloutInUSD * 0.000000001))/10000000000;
    let nanosInUSD = bitCloutInUSD * 0.000000001;


    console.log(bitCloutInUSD, `${nanosInUSD}`);

    return {
      bitCloutInUSD,
      bitCloutInUSDRounded,
      nanosInUSD,
      nanosInUSDRounded,
      bitcloutInBitcoin,
      bitCoinToUSD: price
    }
  } catch (ex) {
    throw ex;
  }
}


export const inOtherFiat = function(theRate, fiatRate) {
  // return Math.round(100* (theRate * fiatRate)) / 100;
  return theRate * fiatRate;
}

export const nanosToBitClout = function(nanos) {
  return nanos * 0.000000001;
}


export const bitCloutToNanos = function(nanos) {
  return nanos / 0.000000001;
}

export const TargetActionEnum = {
  10: 'ReClout',
  20: 'Comment', 
  30: 'Quote'
}

export const TargetActionEnumReverse = {
  "ReClout" : 10,
  "Comment" : 20,
  "Quote" : 30
};