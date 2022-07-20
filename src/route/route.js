const express = require('express');
const router =  express.Router();
const {postURL, getURL} = require('../controller/urlController');

router.post('/url/shorten', postURL);
router.get('/:urlCode', getURL);

router.all('/**', (res) => {
    res.status(404).send({status: false, message: 'No such URL found'});
})

module.exports = router;