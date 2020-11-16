const deltaMorningCurrentPrice = require('../tinkoff-api/deltaMorningCurrentPrice')

const deltaMorningCurrentPriceApi = async (req, res, next) => {
        let deltaPrice = 0;
        try {
            deltaPrice = await deltaMorningCurrentPrice.deltaMorningCurrentPrice();
        } catch (err) {
            console.log(err)
        }

        res.json({
            prices: deltaPrice
        })

    }

    exports.deltaMorningCurrentPriceApi = deltaMorningCurrentPriceApi;

   