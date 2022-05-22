const shortId = require("shortid");
const Url = require("../models/urlModel");
const isVlidurl = require("url-validation")
const redis = require("redis");
const isValidUrl = require("valid-url")

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



const { promisify } = require("util");

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const creatUrl = async function (req, res) {
    let  longUrl  = req.body.longUrl
    let shortCode = shortId.generate();
    const baseUrl = 'https://localhost:3000'

      if(!(isValid(longUrl))){
          return res.status(400).send({ status : false , data : " enter the longUrl"})
      }
    if (Object.keys(req.body).length > 1) {
        return res.status(400).send({ status: false, message: "only One data need in " })
    }



   

    if(longUrl) {

        try {

            longUrl = longUrl.trim()

            if (!(longUrl.includes('//'))) {
                return res.status(400).send({ status: false, message: " invalid longUrl" })
            }

            const urlParts = longUrl.split('//')
            console.log(longUrl)
            const scheme = urlParts[0]
            console.log(scheme)
            const uri = urlParts[1]
            console.log(uri)
            let shortenUriDetails

            if (!(uri.includes('.'))) {
                return res.status(400).send({ status: false, message: " invalid longUrl" })
            }
             
            let uriParts = uri.split('.')
            console.log(uriParts)

            if (!(((scheme == "http:") || (scheme == "https:")) && (uriParts[0].trim().length) && (uriParts[1].trim().length))) {
                return res.status(400).send({ status: false, message: " invalid longUrl" })
            }

            shortenUriDetails = await Url.findOne({ longUrl: longUrl })

            if (shortenUriDetails) {
                res.status(201).send({ status: true, data: shortenUriDetails })
            } else {
                let shortUrl = baseUrl + "/" + shortCode.toLowerCase();
                shortenUriDetails = await Url.create({ longUrl: longUrl, shortUrl: shortUrl, urlCode: shortCode })
                await SET_ASYNC(shortCode.toLowerCase(), longUrl)
                res.status(201).send({ status: true, data: shortenUriDetails })
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
        let url1 = req.params.urlCode
        if (!isValid(url1)) {
            return res.status(400).send({ status: false, message: "please enter a urlCode" })
        }

        let cacheProfileData = await GET_ASYNC(url1)
        if (cacheProfileData) {

            console.log("after cache")
            return res.status(302).redirect(cacheProfileData);
        } else {
            const originalUrlDetails = await Url.findOne({ urlCode: url1 })
            if (originalUrlDetails) {
                return res.status(302).redirect(originalUrlDetails.longUrl);
            }
        }

    }
    catch (error) {
        console.error(error);
        return res.status(500).send({ status: false, error: error.message });
    }
}

module.exports.creatUrl = creatUrl
module.exports.getUrl = getUrl




