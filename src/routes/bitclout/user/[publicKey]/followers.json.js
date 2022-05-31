import axios from 'axios'
import {
  getFollows
} from '../../common';



export async function get(req, res, next) {
  try {
  let {publicKey} = req.params;

  let followerPost = getFollows(publicKey); 

  let rez = await axios(followerPost);
  
  res.end(JSON.stringify(rez.data));
  
  } catch (ex) {
    return next(ex);
  }
}