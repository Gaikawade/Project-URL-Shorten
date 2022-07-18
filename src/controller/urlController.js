const urlModel = require('../models/urlModel');
const shortid = require('shortid');

const baseURL = "localhost:3000";

const postURL = async (req, res) => {
    try{
        let data = req.body;
        let {longUrl} = data;

        if(!longUrl) return res.status(400).send({status: false, message: 'Long URL is mandatory'});

        const urlCode = shortid.generate();
        const obj = {
            urlCode: urlCode,
            shortUrl: baseURL + '/' + urlCode,
            longUrl: longUrl
        }

        await urlModel.create(obj);
        let urlData = await urlModel.findOne(obj).select({urlCode: 1, shortUrl: 1, longUrl: 1});
        res.status(201).send({status: true, message: urlData});
    }
    catch(err){
        res.status(500).json({message: err.message});
    }
}

const getURL = async (req, res) => {
    const {urlCode} = req.params.urlCode;
    const find = await urlModel.findOne({urlCode: urlCode});

    if(find){
        return res.status(302).redirect(find.longUrl);
    }else{
        return res.status(404).send({status: false, message: 'URL not found'});
    }
}

module.exports = {postURL, getURL};