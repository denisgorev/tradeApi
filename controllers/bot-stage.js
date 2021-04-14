const {
    Telegraf, Stage, Scenes
} = require('telegraf');
const WizardScene = require('telegraf/scenes/wizard');
const session = require('telegraf/session');
const Share = require('../models/share');

const bot = new Telegraf(process.env.BOT_TOKEN)

const stageCall = async (ctx) => {
    

    const superWizard = new WizardScene(
        'change',
        ctx => {
            ctx.reply("Введите тикер");
            ctx.wizard.state.data = {};
            return ctx.wizard.next();
        },
        ctx => {
            ctx.reply("Введите isin");
            ctx.wizard.state.data.ticker = ctx.message.text;
            return ctx.wizard.next();
        },
        ctx => {
            ctx.reply("Тип (stock, bond)");
            ctx.wizard.state.data.isin = ctx.message.text;
            return ctx.wizard.next();
        },
        ctx => {
            ctx.reply(`Введите количество`);
            ctx.wizard.state.data.type = ctx.message.text;
            return ctx.wizard.next();
            // return ctx.scene.leave();
        },
        ctx => {
            ctx.reply('Введите валюту');
            ctx.wizard.state.data.quantity = ctx.message.text;
            return ctx.wizard.next();
        },
        async ctx => {
            ctx.wizard.state.data.currency = ctx.message.text;
            // console.log(ctx.wizard.state.data);
            try {
                console.log(ctx.wizard.state.data)
                share = await Share.find({ isin: ctx.wizard.state.data.isin });
                console.log(share)
                if (share !== undefined) {
                    console.log('updating')
                    await Share.findOneAndUpdate({ isin: ctx.wizard.state.data.isin },
                        {
                            name: ctx.wizard.state.data.ticker,
                            isin: ctx.wizard.state.data.isin,
                            type: ctx.wizard.state.data.type,
                            quantity: ctx.wizard.state.data.quantity,
                            currency: ctx.wizard.state.data.currency
                        })
                }
                return ctx.scene.leave();
            } catch {
                console.log('что-то не так')
            }
        }

    );
    const stage = new Stage([superWizard]);

    bot.use(session());
    bot.use(stage.middleware());
    // console.log(ctx)
    ctx.scene.enter('change');


}

exports.stageCall = stageCall;