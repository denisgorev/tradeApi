const deltaPrices = require('../tinkoff-api/deltaPrices');

const {
    Telegraf
} = require('telegraf');

const telegramBot = () => {
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
                        `Изменение цены с начала торгов: ${typeof deltaPrice[i].delta == 'number' ? deltaPrice[i].delta.toFixed(3) + ' ' + deltaPrice[i].currency : 'Нет данных' } 
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
                    `Оценка рублевых активов: ${state.rub.toFixed(2)},\n` +
                    `Оценка долларовых активов: ${state.usd.toFixed(2)},\n` +
                    `Стоимость доллара ${state.currentUSD.toFixed(2)},\n` +
                    `Итого оценка в рублях ${state.totalRUB.toFixed(2)},\n` +
                    `Итого оценка в долларах ${state.totalUSD.toFixed(2)}`)

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