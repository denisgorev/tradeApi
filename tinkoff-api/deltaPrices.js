const OpenAPI = require('@tinkoff/invest-openapi-js-sdk');
const moment = require('moment')
const apiURL = 'https://api-invest.tinkoff.ru/openapi/';
const socketURL = 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws';
const secretToken = process.env.TOKEN; // токен для сандбокса
const FIGIUSD = 'BBG0013HGFT4';
const api = new OpenAPI({
    apiURL,
    secretToken,
    socketURL
});

//Функция для получения времени. Возможно получение как текущего, так и утреннего времени (10 утра)
const getDateTime = (morningTime = 0, increment = 0) => {
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

//функция для получения FIGI всех инструментов в портфолио
const currentFIGIs = async () => {
    const figis = []
    const tickers = []
    const quantities = []
    let portfolio
    try {
        portfolio = await api.portfolio();
    } catch (err) {
        console.log(err)
        return (next)
    }

    for (let iter of portfolio.positions) {
        figis.push(iter.figi)
        tickers.push(iter.ticker)
        quantities.push(iter.balance)
    }
    return [figis, tickers, quantities];
}

//функция для получения текущей цены актива по FIGI

const currentPriceGetter = async (figi) => {
    let currentPrice = {}
    try {
        currentPrice = await api.orderbookGet({
                figi: figi,
                depth: 1
            },
            (ob) => {
                console.log(ob.bids)
            })
    } catch (err) {
        console.log(err)
        return next(err)
    }
    return currentPrice.lastPrice
}



const deltaMorningCurrentPrice = async () => {

    let deltaArray = []
    let instrument

    const [figis] = await currentFIGIs();

    console.log(figis);


    for (let figi of figis) {
        console.log(figi)
        let morningPrice = 0
        try {
            morningPrice = await api.candlesGet({
                from: getDateTime(morningTime = 1),
                to: getDateTime(morningTime = 1, increment = 5),
                figi: figi,
                interval: '5min',
            })
        } catch (err) {
            console.log(err)
            return next(err)
        }


        let currentPrice = await currentPriceGetter(figi);

        console.log(morningPrice)
        morningPrice = morningPrice.candles.length == 0 ? 'Нет данных по открытию' : morningPrice.candles[0].c;

        console.log(morningPrice)
        console.log(currentPrice)

        try {
            instrument = await api.searchOne({
                figi: figi
            })
        } catch (err) {
            console.log(err)
            return next(err)
        }

        const delta = typeof morningPrice == 'number' ? currentPrice - morningPrice : morningPrice;
        console.log(instrument.name)
        console.log(delta)
        deltaArray.push({
            openPrice: morningPrice,
            currentPrice: currentPrice,
            delta: delta,
            name: instrument.name,
            time: getDateTime(),
            currency: instrument.currency
        })
    }
    console.log(deltaArray)
    return deltaArray;

}


const portfolioDelta = async () => {
    let operations = []
    const incomesUSD = []
    const incomesRUB = []

    try {
        operations = await api.operations({
            from: getDateTime(morningTime = 1),
            to: getDateTime(),
        })
    } catch (err) {
        console.log(err)
        return next(err)
    }
    const data = operations.operations
    data.forEach(operation => {
        operation.currency === 'USD' ? incomesUSD.push(operation.payment) : incomesRUB.push(operation.payment)
    })
    console.log(incomesRUB)
    console.log(incomesUSD)
    return portfolioState()
}

const portfolioState = async () => {
    const sum = {
        rub_cur: 0, //рубли в кэше
        usd_cur: 0,
        rub: 0,
        usd: 0,
        currentUSD: 0,
        totalRUB: 0,
        totalUSD: 0
    }
    const [figis, tickers, quantities] = await currentFIGIs();
    const getCurrency = await api.portfolioCurrencies();
    for (let iter = 0; iter < tickers.length; iter++) {
        const ticker = tickers[iter];
        const instrument = await api.searchOne({
            ticker
        })
        const currentPrice = await currentPriceGetter(instrument.figi)
        const quantity = quantities[iter];
        if (instrument.currency === 'RUB' && instrument.figi!=='BBG0013HGFT4') {
            sum.rub = sum.rub + currentPrice * quantity; 
            console.log(instrument)
        } 
        if (instrument.currency !== 'RUB') {
            sum.usd = sum.usd + currentPrice * quantity
        } 
    }
    sum.rub_cur = getCurrency.currencies[0].balance;
    sum.usd_cur = getCurrency.currencies[1].balance;
    sum.currentUSD = await currentPriceGetter(FIGIUSD);
    sum.totalRUB = sum.rub + (sum.usd + sum.usd_cur) * await currentPriceGetter(FIGIUSD) ;
    sum.totalUSD = sum.totalRUB / await currentPriceGetter(FIGIUSD);

    // console.log(sum) 
    return sum
}


exports.deltaMorningCurrentPrice = deltaMorningCurrentPrice;
exports.portfolioDelta = portfolioDelta;
exports.portfolioState = portfolioState;