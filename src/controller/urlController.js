const shortid = require('shortid');
const validURL = require('valid-url');
const urlModel = require('../models/urlModel');

const baseURL = "localhost:3000";

const postURL = async (req, res) => {
    try{
        let {longUrl} = req.body;

        if(!longUrl) return res.status(400).send({status: false, message: 'Long URL is mandatory'});
        if(!validURL.isUri(longUrl)) return res.status(200).send({status: false, message: 'Please enter a valid URL'});

        let url = await urlModel.findOne({longUrl});
        if(url){
            return res.status(400).send({status: false, message: 'You have already shorten this URL', shortUrl: url.shortUrl});
        }else{
            let urlCode = shortid.generate();
            let shortUrl = baseURL + '/' + urlCode;

            url = new urlModel ({
                urlCode,
                shortUrl,
                longUrl
            });
            await url.save();

            res.status(201).send({status: true, data: url});
        }
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