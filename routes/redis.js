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
    return new Promise((resolve, reject) => {
        redisClient.zadd(Constants.REDIS_KEY, parseInt(moment().format('x')), body.element, (error, number) => {
            if (error) {
                console.log("ZADD ERROR - ", error);
            }
            resolve(number);
        });
    }).then(reply => {
        return res.send(200).send({success: reply});
    });
}


function getElementIndex(req, res) {
    let element = req.params.element;
    return redisClient.zrank(Constants.REDIS_KEY, element, function(error, rank) {
        return res.status(200).send({rank: rank + 1});
    });
}

function removeElement(req, res) {
    let body = req.body;

    return new Promise((resolve, reject) => {
        redisClient.zrem(Constants.REDIS_KEY, body.element, function(err, reply) {
            if (err) {
                console.log("ZADD ERROR - ", error);
                reject(error);
            }

            resolve(reply);
        });
    }).then(reply => {
        return res.sendStatus(200).send(reply);
    });
}

function getAllElements(req, res) {
    return new Promise((resolve, reject) => {
        return redisClient.zrange(Constants.REDIS_KEY, 0, -1, (err, elements) => {
            if (err) {
                console.log("ZRANGE ERR -- ", err);
                reject(err);
            }
            resolve(elements);
        })
    }).then(elements => {
        res.status(200).send({elements: elements});
    })
}

// routes
router.post('/add', addElement);
router.get('/index/:element', getElementIndex);
router.post('/remove', removeElement);
router.get("/", getAllElements);

module.exports = router;