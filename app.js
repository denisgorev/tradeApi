
const port = process.env.PORT || 5000;
const express = require("express");
const app = express();
require('dotenv').config();
const telegramBot = require('./controllers/bot-controller')

const apiRoutes = require('./routes/api-routes')

const test = async () => {
    try {
        await api.setCurrenciesBalance({
            currency: 'USD',
            balance: 1000
        })
        await api.setPositionBalance({
            "figi": "BBG000BR2B91",
            "balance": 20
        })
        await api.setPositionBalance({
            "figi": "BBG000J2XL74",
            "balance": 20
        })
        await api.setPositionBalance({
            "figi": "BBG008F2T3T2",
            "balance": 20
        })
        await api.setPositionBalance({
            "figi": "BBG000BPD168",
            "balance": 20
        })
        await api.setPositionBalance({
            "figi": "BBG000C0LW92",
            "balance": 20
        })
        
        //console.log(await api.accounts())
        //console.log(await api.portfolio())
        //console.log(await api.stocks())

    } catch (err) {
        console.log(err);
    }

}



app.use("/tinkoffapi/portfolio/", apiRoutes);

app.use((req, res, next) => {
	console.log("ошибка");
});

app.use((error, req, res, next) => {
	console.log(error);
});


//test();
//deltaMorningCurrentPrice()
telegramBot.telegramBot()


app.listen(port, () => console.log("Server is started"));