
import * as dotenv from 'dotenv';
dotenv.config();

import * as newrelic from 'newrelic';


import consolestamp from 'console-stamp';
consolestamp(console);


import sirv from 'sirv';
// import polka from 'polka';
import express from 'express';
import compression from 'compression';
import * as sapper from '@sapper/server';

import apicache from 'apicache-plus';

import {json, text} from 'body-parser';
import redis from 'redis';


const { PORT, NODE_ENV, GOOGLE_ANALYTICS_KEY } = process.env;
const dev = NODE_ENV === 'development';
// cloutcast.redis.cache.windows.net:6380,password=drD09X83C3hfOAwQY7ayGpYWatNzzrHMYRJFvA0G7XE=,ssl=True,abortConnect=False

// const redisClient = redis.createClient({
// 	host: 'cloutcast.redis.cache.windows.net',
// 	port: 6380,
// 	tls: true,
// 	auth_pass: "CrL8Zfsd2BKl5DLLzeVca+28131fDfuEwEaj90Wyz4s=",
// 	detect_buffers: true,
// 	serverTimeout: "100000"

// });


let app = express();
// polka()
app
	.use((req, res, next) => {
		res.setHeader("Access-Control-Allow-Origin", "*");
		return next();
	})
	.use(text({type: 'text/plain'}))
  .use(json({type: 'application/json'})) 
	// .use(apicache("10 minutes", (req, res) => req.headers['cache-control'] == 'cache' ? true : false, {redisClient}))
	.use(compression({ threshold: 0 }))
	.use(
		sirv('static', { dev }),
		sapper.middleware({
			session: () => ({
				GOOGLE_ANALYTICS_KEY
			})
		})
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});
