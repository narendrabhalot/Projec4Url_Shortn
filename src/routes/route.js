const express = require('express');
const router = express.Router();

const urlController = require('../controller/urlController')



router.post("/url/shorten",urlController.creatUrl )

router.get("/:urlcode", urlController.getUrl )

module.exports = router;