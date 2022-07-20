const shortid = require('shortid');
const validURL = require('valid-url');
const redis = require('redis');
const {promisify} = require('util');

const urlModel = require('../models/urlModel');

const baseURL = "localhost:3000";

//!connecting REDIS
const redisClient = redis.createClient(
    13518,
    "redis-13518.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("1QsKJ8oEfrikHPI6zrG4Yp6BoypaoZOj", (err) => {
    if (err) throw err;
});
redisClient.on('connect', async () => {
    console.log("Redis client connected....");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

const postURL = async (req, res) => {
    try{
        let {longUrl} = req.body;

        if(!longUrl) return res.status(400).send({status: false, message: 'Long URL is mandatory'});
        if(!validURL.isUri(longUrl)) return res.status(200).send({status: false, message: 'Please enter a valid URL'}); 

        let url = await urlModel.findOne({longUrl});
        if(url){
            return res.status(400).send({status: false, message: 'You have already shorten this URL', shortUrl: url.shortUrl});
        }else{
            let urlCode = shortid.generate().toLowerCase();     //* Generating a code from shortid generate function
            let shortUrl = baseURL + '/' + urlCode;

            url = {urlCode, shortUrl, longUrl};
            let doc = await urlModel.create(url);

            await SET_ASYNC(`${longUrl}`, JSON.stringify({longUrl: longUrl, shortUrl: shortUrl, urlCode: urlCode}));

            res.status(201).send({status: true, data: doc});
        }
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
}

const getURL = async (req, res) => {
    try{
        const urlCode = req.params.urlCode;
        const cachedData = await GET_ASYNC(`${urlCode}`);

        if(cachedData){
            return res.status(302).redirect(JSON.parse(cachedData));
        }else{
            const find = await urlModel.findOne({urlCode: urlCode});
            if(find){
                await SET_ASYNC(`${urlCode}`, JSON.stringify(find.longUrl));
                return res.status(302).redirect(find.longUrl);
            }else{
                return res.status(404).send({status: false, message: 'URL not found'});
            }
        }
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

module.exports = {postURL, getURL};