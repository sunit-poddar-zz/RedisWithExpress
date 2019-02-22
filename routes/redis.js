'use strict';

const moment = require('moment');
const router = require('express').Router();

const redis = require("redis");
const redisClient = redis.createClient();
const Constants = require("../utils/constants");
const Promise = require("bluebird");


Promise.promisifyAll(redisClient);

redisClient.on("error", (error) => {
    console.log("REDIS ERROR -- ", error);
});


function addElement(req, res) {
    let body = req.body;
    redisClient.zadd(Constants.REDIS_KEY, parseInt(moment().format('x')), body.element, function(error, reply) {
        if (error) {
            console.log("ZADD ERROR - ", error);
        }
        console.log(reply);
        return res.sendStatus(200).send(reply);
    }); 
}


function getElementIndex(req, res) {
    let element = req.params.element;
    return redisClient.zrank(Constants.REDIS_KEY, element, function(error, rank) {
        console.log(rank + 1);
        return res.status(200).send({rank: rank + 1});
    });
}

function removeElement(req, res) {
    let body = req.body;
    return redisClient.zrem(Constants.REDIS_KEY, body.element, function(err, reply) {
        if (err) {
            console.log("ZADD ERROR - ", error);
        }
        console.log(reply);
        return res.sendStatus(200).send(reply);
    })
}

// routes
router.post('/add', addElement);
router.get('/index/:element', getElementIndex);
router.post('/remove', removeElement);

module.exports = router;