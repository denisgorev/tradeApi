const fetch = require('node-fetch');
let security;
let currentDate;
let sum = 0;
const Share = require('../models/share');
let securitiesMongo = [];
let securityType;
let securityCurrency;
let bondPrice;
let couponValue;
let URL;


const getExchangeUSD = async (date) => {
    let exchRub = await fetch('https://iss.moex.com/iss/engines/currency/markets/selt/securities/USD000000TOD.json?iss.meta=off')
    let exchRubUsd = await exchRub.json();
    if (exchRubUsd.marketdata.data[0][13] === undefined) {
        let exchRub = await fetch(`https://iss.moex.com/iss/statistics/engines/futures/markets/indicativerates/securities.json?from=${date}`);
        let exchRubUsd = await exchRub.json();
        console.log(exchRubUsd.securities.data[13][3])
        return exchRubUsd.securities.data[13][3];
    } else {
        return exchRubUsd.marketdata.data[0][13]
    }
}

const getBondPrice = async (index, URL, bondInfo) => {

    let bondCandle = await fetch(URL);
    bondInfo = await fetch(bondInfo);
    if (bondInfo.ok && bondCandle.ok) { // если HTTP-статус в диапазоне 200-299
        // получаем тело ответа
        let bondValue = await bondInfo.json();
        let bondValuePrice;
        bondValue = bondValue.securities.data;

        for (let j in bondValue) {
            if (bondValue[j][0] === security) {
                bondValuePrice = bondValue[j][10];
                couponValue = bondValue[j][7]

            }
        }
        bondPrice = await bondCandle.json();
        bondPrice = bondPrice.candles.data;

        if (bondPrice = []) {
            date = getCurrentDate(1);
            URL = `https://iss.moex.com/iss/engines/stock/markets/bonds/securities/${security}/candles.json?from=${date}`;
            response = await fetch(URL);
            bondPrice = await response.json();
            bondPrice = bondPrice.candles.data;
        }

        bondPrice = bondPrice[bondPrice.length - 1][1] / 100;
        bondPrice = bondPrice * bondValuePrice * securitiesMongo[index].quantity + couponValue * securitiesMongo[index].quantity;
        return bondPrice
    } else {
        console.log("Ошибка HTTP: " + response.status);
    }
}

const getCurrentDate = (y = 0) => {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let currentDate = date.getDate();
    let dow = date.getDay(); //день недели
    if (y === 1) {
        currentDate = date.getDate() - 1;
    }
    if (dow === 0) { //если воскресенье
        currentDate = date.getDate() - 2;
    }
    date = year + '-' + month + '-' + currentDate;
    return date;
}
const test = async () => {

    try {
        console.log('call mongo');
        securitiesMongo = await Share.find({}); //цб в наличии из Монги
        // console.log(securitiesMongo);
    } catch (err) {
        console.log(err);
    }
}
const getStockData = async () => {
    sum = 0;
    await test();
    let response;

    for (let i in securitiesMongo) {
        let date = getCurrentDate();
        securityType = securitiesMongo[i].type;
        securityCurrency = securitiesMongo[i].currency;
        if (securityType === 'stock') {
            security = securitiesMongo[i].name;
            URL = `https://iss.moex.com/iss/engines/stock/markets/shares/securities/${security}/candles.json?from=${date}`;
            response = await fetch(URL);
            if (response.ok) { // если HTTP-статус в диапазоне 200-299
                // получаем тело ответа
                let json = await response.json();

                let securitiesInfo = json.candles.data;
                if (securitiesInfo = []) {
                    date = getCurrentDate(1);
                    URL = `https://iss.moex.com/iss/engines/stock/markets/shares/securities/${security}/candles.json?from=${date}`;
                    response = await fetch(URL);
                    json = await response.json();
                    securitiesInfo = json.candles.data;
                }
                let securitiesPrice = securitiesInfo[securitiesInfo.length - 1][1];
                sum = sum + securitiesPrice * securitiesMongo[i].quantity;
                console.log(sum, security, securitiesPrice * securitiesMongo[i].quantity);
            } else {
                console.log("Ошибка HTTP: " + response.status);
            }
        } else if (securityType === 'bond' && securityCurrency === 'RUB') {
            security = securitiesMongo[i].isin;
            URL = `https://iss.moex.com/iss/engines/stock/markets/bonds/securities/${security}/candles.json?from=${date}`;
            let bondInfo = 'https://iss.moex.com/iss/engines/stock/markets/bonds/boards/TQCB/securities.json?iss.meta=off&iss.only=securities';
            bondPrice = await getBondPrice(i, URL, bondInfo, securityCurrency);
            sum = sum + bondPrice;
            console.log(sum, security, bondPrice);

        } else if (securityType === 'bond' && securityCurrency === 'USD') {
            security = securitiesMongo[i].isin;
            URL = `https://iss.moex.com/iss/engines/stock/markets/bonds/securities/${security}/candles.json?from=${date}`;
            let bondInfo = 'http://iss.moex.com/iss/engines/stock/markets/bonds/boards/TQOD/securities.json?iss.meta=off';
            bondPrice = await getBondPrice(i, URL, bondInfo, securityCurrency);

            exchRubUsd = await getExchangeUSD(date);
            sum = sum + bondPrice * exchRubUsd;
            console.log(sum, bondPrice * exchRubUsd, security);
        } else if (securityType === 'cash' && securityCurrency === 'USD') {
            exchRubUsd = await getExchangeUSD(date);
            sum = sum + securitiesMongo[i].quantity * exchRubUsd
            console.log(sum, securitiesMongo[i].quantity * exchRubUsd, security);
        } else if (securityType === 'cash' && securityCurrency === 'RUB') {
            sum = sum + securitiesMongo[i].quantity

        }

    }
    return sum;

}

exports.getStockData = getStockData;