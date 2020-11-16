const deltaPrices = require('../tinkoff-api/deltaPrices')

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
    }
    res.json({
        cost: deltaPortfolioCost
    })
}

    exports.deltaMorningCurrentPriceApi = deltaMorningCurrentPriceApi;
    exports.deltaPortfolioCostApi = deltaPortfolioCostApi;

   