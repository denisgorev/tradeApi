const express = require("express");
const router = express.Router();
const deltaPriceApi = require('../controllers/api-controller');

router.get('/deltaprice/', deltaPriceApi.deltaMorningCurrentPriceApi);
router.get('/deltaportfolio/', deltaPriceApi.deltaPortfolioCostApi);
router.get('/portfoliostate/', deltaPriceApi.portfolioStateApi);
router.get('/', deltaPriceApi.wakeUpApi);


module.exports = router;