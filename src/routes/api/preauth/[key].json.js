import { v4 } from "uuid"

export async function get(req, res, next) {
  try {
  const {PREAUTH_SECRET_KEY = v4() } = process.env;
  const {key} = req.params;


  if (PREAUTH_SECRET_KEY == key) {
    return res.end();
  } else {
    res.statusCode = 401;
    return res.end();
  }
  } catch (ex) {
    return next(ex);
  }
}