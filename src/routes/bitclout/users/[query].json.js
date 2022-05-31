import axios from 'axios';

import {queryUsersPost} from '../common';


export async function get(req, res, next) {
  try {
    const {query = ""} = req.params;
    if (query.length < 2) {
      return res.end("[]");
    }

    let queryUsers = await axios(queryUsersPost(query));

    let queryUsersData = await queryUsers.data;

    res.end(JSON.stringify(queryUsersData));



  } catch (ex) {
    console.dir(ex);
    res.status(500);
    res.end(JSON.stringify({error: true, message: ex.message || "Unknown"}));
  }
  
}