const shortId = require("shortid");
const Url = require("../models/urlModel");
const isVlidurl = require('url-validation')

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const creatUrl = async function (req, res) {
    const { longUrl } = req.body;
    const baseUrl = 'hts://localhost:3000'
    if (!isValid(longUrl)) {
        return res.status(400).send({ status: false, message: "please enter a longUrl" })
    }

    // check base url
    if (!isVlidurl(baseUrl)) {
        return res.status(400).send({ status: false, message: "Invalid base url" });
    }

    // check long url
    if (isVlidurl(longUrl)) {
        try {
            let url = await Url.findOne({ longUrl });
            if (url) {
                return res.status(400).send({ status: false, data: "already used" });
            } else {
                // create url code
                let urlCode = shortId.generate();
                let shortUrl = baseUrl + "/" + urlCode;

                url = new Url({
                    longUrl,
                    shortUrl,
                    urlCode,
                });
                await url.save();
                return res.status(201).send({ status: true, data: url });
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
        let url = await Url.findOne({ urlCode: url1 });

        if (url) {
            return res.status(302).redirect(url.longUrl);
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




