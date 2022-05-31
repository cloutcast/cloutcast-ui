import axios from 'axios';

export async function get(req,res,next) {
  try {
    let rData = await axios.get("https://raw.githubusercontent.com/cloutcast/docs/main/README.md?latest");
    let out = rData.data;

    res.end(out.toString());
    
  } catch (ex) {
    return next(ex);
  }
}