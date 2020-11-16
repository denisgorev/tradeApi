const express = require("express");
const router = express.Router();
const deltaMorningCurrentPriceApi = require('../controllers/api-controller')

router.get('/deltaprice/', deltaMorningCurrentPriceApi.deltaMorningCurrentPriceApi)

module.exports = router;