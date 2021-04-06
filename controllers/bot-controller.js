const deltaPrices = require('../tinkoff-api/deltaPrices');
const mosStockEx = require('../tinkoff-api/mosStockEx');

const {
    Telegraf
} = require('telegraf');

const telegramBot = () => {
    console.log('start bot')
    const bot = new Telegraf(process.env.BOT_TOKEN) //сюда помещается токен, который дал botFather
    // bot.start((ctx) => ctx.reply(ctx.from))
    bot.start((ctx) => ctx.reply(`Привет, ${ctx.from.first_name}! Получи информацию по своему брокерскому счету. Для получения списка возможных операций внапиши /help`)) //ответ бота на команду /start
    bot.help((ctx) => ctx.reply('Пока я умею выполнять только команды /deltaPrice и /portfolioState. /deltaPrice показывает изменение в стоимости 1 единицы актива по портфелю с начала торгов. /portfolioState показывает текущее состояние портфлея')) //ответ бота на команду /help
    bot.on('sticker', (ctx) => ctx.reply('')) //bot.on это обработчик введенного юзером сообщения, в данном случае он отслеживает стикер, можно использовать обработчик текста или голосового сообщения
    bot.command('deltaPrice', async (ctx) => {
        if (ctx.from.id === 275498236) {
            try {
                ctx.reply('Выполняется запрос изменения цены единицы актива в портфеле. Обработка может занять несколько минут. ')
                const deltaPrice = await deltaPrices.deltaMorningCurrentPrice();

                for (let i = 0; i < deltaPrice.length; i++) {
                    ctx.replyWithHTML(
                        `Наименование актива: ${deltaPrice[i].name}, \n` +
                        `Цена открытия: ${deltaPrice[i].openPrice} \n` +
                        `Цена текущая: ${deltaPrice[i].currentPrice}\n` +
                        `Время запроса: ${deltaPrice[i].time} \n` +
                        `Изменение цены с начала торгов: ${typeof deltaPrice[i].delta == 'number' ? deltaPrice[i].delta.toFixed(3) + ' ' + deltaPrice[i].currency : 'Нет данных'} 
                `);
                }
            } catch (err) {
                console.log(err)
                ctx.reply('Что-то не так');
            }
        } else ctx.reply('Ты не Денис');
    });

    bot.command('portfolioState', async (ctx) => {
        if (ctx.from.id === 275498236) {
            try {
                ctx.replyWithHTML('Выполняется запрос состояния портфеля. Обработка может занять несколько минут. ');
                const state = await deltaPrices.portfolioState();
                ctx.replyWithHTML(
                    `Оценка рублевых активов: ${state.rub.toFixed(2)} руб.,\n` +
                    `Оценка долларовых активов: ${state.usd.toFixed(2)} $,\n` +
                    `Рубли в кэше: ${state.rub_cur} руб.,\n` +
                    `Доллары в кэше: ${state.usd_cur} $.,\n` +
                    `Стоимость доллара ${state.currentUSD.toFixed(2)} руб.,\n` +
                    `Итого оценка в рублях ${state.totalRUB.toFixed(2)} руб.,\n` +
                    `Итого оценка в долларах ${state.totalUSD.toFixed(2)} $`)

            } catch (err) {
                console.log(err);
                ctx.reply('Что-то не так');
            }
        } else {
            ctx.reply('Ты не Денис');
        }
    })

    bot.command('moexstat', async (ctx) => {
        if (ctx.from.id === 275498236) {
            try {
                ctx.reply('Выполняется запрос оценки портфеля на Мосбирже')
                const state = await mosStockEx.getStockData();
                console.log(state)
                ctx.replyWithHTML(
                    `Оценка рублевых активов: ${state.rub.toFixed(2)} руб.,\n` +
                    `Оценка долларовых активов: ${state.usd.toFixed(2)} $,\n` +
                    `Рубли в кэше: ${state.rub_cur} руб.,\n` +
                    `Доллары в кэше: ${state.usd_cur} $.,\n` +
                    `Стоимость доллара ${state.currentUSD.toFixed(2)} руб.,\n` +
                    `Итого оценка в рублях ${state.totalRUB.toFixed(2)} руб.,\n` +
                    `Итого оценка в долларах ${state.totalUSD.toFixed(2)} $`)
            } catch (err) {
                console.log(err);
                ctx.reply('Что-то не так');
            }
        } else {
            ctx.reply('Ты не Денис');
        }
    })


    bot.command('total', async (ctx) => {
        if (ctx.from.id === 275498236) {
            try {
                ctx.reply('Выполняется запрос в портфели. Это может занять несколько минут')
                const stateMosEx = await mosStockEx.getStockData();
                const stateSPB = await deltaPrices.portfolioState();
                // console.log(totalSumRub)

                ctx.replyWithHTML(
                    `Оценка рублевых активов: ${(stateMosEx.rub + stateSPB.rub).toFixed(2)} руб.,\n` +
                    `Оценка долларовых активов: ${(stateMosEx.usd+ stateSPB.usd).toFixed(2)} $,\n` +
                    `Рубли в кэше: ${(stateMosEx.rub_cur + stateSPB.rub_cur).toFixed(2)} руб.,\n` +
                    `Доллары в кэше: ${(stateMosEx.usd_cur + stateSPB.usd_cur).toFixed(2)} $.,\n` +
                    `Стоимость доллара ${(stateMosEx.currentUSD).toFixed(2)} руб.,\n` +
                    `Итого оценка в рублях ${(stateMosEx.totalRUB + stateSPB.totalRUB).toFixed(2)} руб.,\n` +
                    `Итого оценка в долларах ${(stateMosEx.totalUSD + stateSPB.totalUSD).toFixed(2)} $`)
            } catch (err) {
                console.log(err);
                ctx.reply('Что-то не так');
            }
        } else {
            ctx.reply('Ты не Денис');
        }
    })



    bot.hears('hi', (ctx) => ctx.reply('Hey there')); // bot.hears это обработчик конкретного текста, данном случае это - "hi"
    bot.launch(); // запуск бота
}

exports.telegramBot = telegramBot;