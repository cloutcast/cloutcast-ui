import axios from 'axios';
import {
  xRate
} from "./common";
export async function get(req, res, next) {
  try {
    
    let xR = await xRate();
    res.end(JSON.stringify(xR))

  } catch (ex) {
    console.error(ex);
    return next(ex);
  }
}