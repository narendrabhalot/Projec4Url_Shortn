const shortId = require("shortid");
const Url = require("../models/urlModel");
const isVlidurl = require("url-validation")
const redis = require("redis");
const isValidUrl = require("valid-url")


const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    17399,
    "redis-17399.c241.us-east-1-4.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("iyFijy4mGJcEvJ7dVi8IYglYrXkO0XzO", function (er) {
    if (er) throw er;
});

redisClient.on("connect", async function () {
    console.log(" hello Narendra! Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const creatUrl = async function (req, res) {
    const { longUrl } = req.body;

    const baseUrl = 'https://localhost:3000'

    if (!isValid(longUrl)) {
        return res.status(400).send({ status: false, message: "please enter a longUrl" })
    }

    if(!isValidUrl.isWebUri(baseUrl)){
        return res.status(400).send({ status: false, message: "enter a valid baseUrl" })
    }

    if (isVlidurl(longUrl)) {

        try {

            let cacheProfileData = await GET_ASYNC(`${req.body.longUrl}`)

            if (cacheProfileData) {
                console.log(cacheProfileData)
                let changetoparse = JSON.parse(cacheProfileData)
                console.log("after set longurl")
                return res.status(200).send({ status: true, msg: " longurl already used", data: changetoparse })
            
            } else {

                let url = await Url.findOne({ longUrl });
                // create url code
                let urlCode = shortId.generate();
                let shortUrl = baseUrl + "/" + urlCode;
                let createData = {}
                url = new Url({
                    longUrl,
                    shortUrl,
                    urlCode,
                });
                await url.save();
                createData["longUrl"]=longUrl
                createData["shortUrl"]=shortUrl
                createData["urlCode"]=urlCode

                await SET_ASYNC(`${req.body.longUrl}`, JSON.stringify(createData))

                return res.status(201).send({ status: true, data:createData });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send({ status: false, error: error.message });
        }
    }
    else {
        return res.status(400).send({ status: false, message: "Invalid long url" });
    }
}
////////////////////***get api***////////////////

const getUrl = async (req, res) => {
    try {
        let url1 = req.params.urlcode
        if (!isValid(url1)) {
            return res.status(400).send({ status: false, message: "please enter a urlCde" })
        }
        
        let url = await Url.findOne({ urlCode: url1 });

        if (url) {
            let cacheProfileData = await GET_ASYNC(`${url1}`)
            if (cacheProfileData) {
                let changetoparse = JSON.parse(cacheProfileData)
                console.log("after cache")
                return res.status(302).redirect(changetoparse.longUrl);

            }
            else {
                await SET_ASYNC(`${url1}`, JSON.stringify(url))
                console.log("before cache")
                return res.status(302).redirect(url.longUrl);
            }
        } else {
            return res.status(404).send({ status: false, message: "No url found" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send({ status: false, error: error.message });
    }
}

module.exports.creatUrl = creatUrl
module.exports.getUrl = getUrl




