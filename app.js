const WAIT_INTERVAL = 9000//1680000 // 28 minutes
const TIMEOUT = 27005//28800000 //8 hours
let interval = 0;

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



const axios = require('axios');

const wakeUp = async () => {
    try{
        await axios.get('http://localhost:5000/tinkoffapi/portfolio/')
    } catch (err){
        console.log(err)
    }
};
const timeFinish = () => {
    clearInterval(interval);
    console.log('go to sleep');
}

interval = setInterval(wakeUp, WAIT_INTERVAL);
setTimeout(timeFinish, TIMEOUT);

telegramBot.telegramBot()


app.listen(port, () => console.log("Server is started"));