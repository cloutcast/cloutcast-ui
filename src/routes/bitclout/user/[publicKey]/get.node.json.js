import axios from 'axios'
import {
  getProfile, getFollows
} from '../../common';



export async function get(req, res, next) {
  try {
  let {publicKey} = req.params;
  let {xccfollows = "no"} = req.headers;
  // let {BITCLOUT_API_URL} = process.env;
  let newConfigBlock = getProfile(publicKey);
  newConfigBlock.url = "https://bitclout.cloutcast.io/api/v0/get-profiles";
  console.log(newConfigBlock);

  let rez = await axios(newConfigBlock);
  
  if (xccfollows == "yes" ) {
    console.log("hmm..");
  }

  let followerCount = 0;
  let {ProfilesFound: Profile = []} = rez.data;
  let {Username = null} = Profile[0];

  if (!!Username) {
    let gf = getFollows(Username);
    let af = await axios(gf);
    let fData = af.data;
    // console.log(fData);
    followerCount = fData.NumFollowers || 0;

  }


  res.end(JSON.stringify({
    followerCount,
    ...Profile[0]
  }));
  
  } catch (ex) {
    return next(ex);
  }
}