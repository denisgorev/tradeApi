const deltaMorningCurrentPrice = require('../tinkoff-api/deltaPrices')

const {
    Telegraf
} = require('telegraf');

const telegramBot = () => {
    const bot = new Telegraf(process.env.BOT_TOKEN) //сюда помещается токен, который дал botFather
    bot.start((ctx) => ctx.reply(`Привет, ${ctx.from.first_name}! Получи информацию по своему брокерскому счету. Для получения списка возможных операций внапиши /help`)) //ответ бота на команду /start
    bot.help((ctx) => ctx.reply('Пока я умею выполнять только команду /deltaPrice. Она показывает изменение в стоимости 1 единицы актива по портфелю с начала торгов')) //ответ бота на команду /help
    bot.on('sticker', (ctx) => ctx.reply('')) //bot.on это обработчик введенного юзером сообщения, в данном случае он отслеживает стикер, можно использовать обработчик текста или голосового сообщения
    bot.command('deltaPrice', async (ctx) => {
        try {
            ctx.reply('Обработка запроса может занять несколько минут. ')
            const deltaPrice = await deltaMorningCurrentPrice.deltaMorningCurrentPrice();
            let response = []
            for (let i = 0; i < deltaPrice.length; i++) {
                ctx.reply(`
                Наименование актива: ${deltaPrice[i].name}
                Цена открытия: ${deltaPrice[i].openPrice}
                Цена текущая: ${deltaPrice[i].currentPrice}
                Время запроса: ${deltaPrice[i].time}
                Изменение цены с начала торгов: ${deltaPrice[i].delta.toFixed(3)} ${deltaPrice[i].currency}
                `)
            }
        } catch (err) {
            console.log(err)
            ctx.reply('Что-то не так')
        }
    })
    bot.hears('hi', (ctx) => ctx.reply('Hey there')) // bot.hears это обработчик конкретного текста, данном случае это - "hi"
    bot.launch() // запуск бота
}

exports.telegramBot = telegramBot;