const urlModel = require('../models/urlModel');
const shortid = require('shortid');

const baseURL = "localhost:3000";

const postURL = async (req, res) => {
    try{
        let urlBody = req.body;
        let {longUrl} = urlBody;

        if(!longUrl) return res.status(400).send({status: false, message: 'Long URL is mandatory'});

        const lUrlExists = await urlModel.findOne({longUrl: longUrl});
        if(lUrlExists) return res.status(400).send({status: false, message: 'You have already shorten this URL', shortUrl: lUrlExists.shortUrl});

        const urlCode = shortid.generate();
        const shortUrl = baseURL + '/' + urlCode;

        const sUrlExists = await urlModel.findOneAndDelete({shortUrl: shortUrl});
        if(sUrlExists) return res.status(400).send({status: false, message: 'Short URL already exists'});

        const obj = {
            urlCode: urlCode,
            shortUrl: shortUrl,
            longUrl: longUrl
        }

        await urlModel.create(obj);
        let urlData = await urlModel.findOne(obj).select({urlCode: 1, shortUrl: 1, longUrl: 1, _id: 0});
        res.status(201).send({status: true, message: urlData});
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
}

const getURL = async (req, res) => {
    try{
        const urlCode = req.params.urlCode;
        const find = await urlModel.findOne({urlCode: urlCode});

        if(find){
            return res.status(302).redirect(find.longUrl);
        }else{
            return res.status(404).send({status: false, message: 'URL not found'});
        }
    }
    catch(err){
        res.status(500).json({status: false, message: err.message});
    }
}

module.exports = {postURL, getURL};