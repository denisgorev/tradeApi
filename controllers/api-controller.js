const deltaPrices = require('../tinkoff-api/deltaPrices');
const mosStockEx = require('../tinkoff-api/mosStockEx');

const wakeUpApi = async (req, res) => {
    res.status('200').send('Success 1');
    console.log('wakeup')
};

const deltaMorningCurrentPriceApi = async (req, res, next) => {
    let deltaPrice = 0;
    try {
        deltaPrice = await deltaPrices.deltaMorningCurrentPrice();
    } catch (err) {
        console.log(err)
    }
    res.json({
        prices: deltaPrice
    })
}

const deltaPortfolioCostApi = async (req, res, next) => {
    let deltaPortfolioCost = 0;
    try {
        deltaPortfolioCost = await deltaPrices.portfolioDelta();
    } catch (err) {
        console.log(err)
        return next(err)
    }
    res.json({
        cost: deltaPortfolioCost
    })
}

const portfolioStateApi = async (req, res, next) => {
    let portfolioState = 0;
    try {
        portfolioState = await deltaPrices.portfolioDelta();
    } catch (err) {
        console.log(err)
        return next(err)
    }
    res.json({
        state: portfolioState
    })
}

const getStockData = async (req, res, next) => {
    let stockData;
    try {
        stockData = await mosStockEx.getStockData();
    }
    catch (err) {
        console.log(err)
        return next(err)
    }
    res.json({
        state: stockData
    })
}


exports.portfolioStateApi = portfolioStateApi;
exports.deltaMorningCurrentPriceApi = deltaMorningCurrentPriceApi;
exports.deltaPortfolioCostApi = deltaPortfolioCostApi;
exports.wakeUpApi = wakeUpApi;
exports.getStockData = getStockData;

