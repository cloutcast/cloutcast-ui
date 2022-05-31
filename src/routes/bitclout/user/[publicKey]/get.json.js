import axios from 'axios'
import {
  getProfile, getFollows
} from '../../common';



export async function get(req, res, next) {
  try {
  let {publicKey} = req.params;
  let {xccfollows = "no"} = req.headers;

  let newConfigBlock = getProfile(publicKey);

  let rez = await axios(newConfigBlock);
  
  if (xccfollows == "yes" ) {
    console.log("hmm..");
  }

  let followerCount = 0;
  let {Profile = {}} = rez.data;
  let {Username = null} = Profile;

  if (!!Username) {
    let gf = getFollows(Username);
    let af = await axios(gf);
    let fData = af.data;
    // console.log(fData);
    followerCount = fData.NumFollowers || 0;

  }


  res.end(JSON.stringify({
    followerCount,
    ...Profile
  }));
  
  } catch (ex) {
    return next(ex);
  }
}