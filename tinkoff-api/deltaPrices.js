const OpenAPI = require('@tinkoff/invest-openapi-js-sdk');
const moment = require('moment')
const apiURL = 'https://api-invest.tinkoff.ru/openapi/';
const socketURL = 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws';
const secretToken = process.env.TOKEN; // токен для сандбокса
const api = new OpenAPI({
    apiURL,
    secretToken,
    socketURL
});

const getDateTime = (morningTime=0, increment=0) => {
    if (morningTime === 1) {
        const date = new Date();
        let year = date.getFullYear()
        let month = date.getMonth()
        let currentDate = date.getDate()
       
        let minutes = increment
        var d = new Date(year, month, currentDate, 10, minutes, 0);
        let m = moment(d).format();
        console.log(m);
        return m
    } else {
        let m = moment().format();
        console.log(m);
        return m
    } 
}

const deltaMorningCurrentPrice = async () => {
    const figis = [];
    let deltaArray = []
    try {
        const portfolio = await api.portfolio();

        for (let iter of portfolio.positions) {
            figis.push(iter.figi)
        }

        console.log(figis);


        for (let figi of figis) {
            console.log(figi)
            const morningPrice =
                await api.candlesGet({
                    from: getDateTime(morningTime=1),
                    to: getDateTime(morningTime=1, increment=6),

                    figi: figi,
                    interval: '5min',
                })

            const currentPrice =
                await api.orderbookGet({
                        figi: figi,
                        depth: 1
                    },
                    (ob) => {
                        console.log(ob.bids)
                    })
            console.log(morningPrice.candles[0].time + ' morning time')
            console.log(morningPrice.candles[0].o)
            console.log(currentPrice.lastPrice)
            const instrument = await api.searchOne({
                figi: figi
            })
            const delta = currentPrice.lastPrice - morningPrice.candles[0].o;
            console.log(instrument.name)
            console.log(delta)
            deltaArray.push({
                openPrice: morningPrice.candles[0].o,
                currentPrice: currentPrice.lastPrice,
                delta: delta,
                name: instrument.name,
                time: getDateTime(),
                currency: instrument.currency
            })
        }
        console.log(deltaArray)
        return deltaArray;
    } catch (err) {
        console.log(err);
    }
}


const portfolioDelta = async () => {
    try {
    const operations = api.operations({
        from: getDateTime(morningTime=1),
        to: getDateTime(),
    })
    return operations
} catch (err) {
    console.log(err)
}
}


exports.deltaMorningCurrentPrice = deltaMorningCurrentPrice;
exports.portfolioDelta = portfolioDelta;