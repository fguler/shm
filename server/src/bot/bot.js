const Telegraf = require('telegraf');
const Mdlw = require("./middlewares");
const OutgoingActions = require("./outgoingActions/index")
const Response = require("./response/");
const Ngrok = require('ngrok');


const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

const start = async (server) => {

    const path = `/${process.env.TELEGRAM_WEB_HOOK_PATH}`;

    let url = await Ngrok.connect({
        addr: 7788
    });

    url = url + path;

    await bot.telegram.setWebhook(url);

    server.route({
        method: "POST",
        path: path,
        handler: async (request, h) => {
            bot.handleUpdate(request.payload);
            //bot.handleUpdate(request.payload,request.raw.res);
            return "ok."
        }
    });


    bot.use(Mdlw.auth);

    bot.on('text', Response.process)

    bot.catch((err) => {
        console.log('Telegram Error :', err);
    });

    //bot.startPolling();

};

module.exports = Object.assign({}, { start }, OutgoingActions(bot));



/* const start = () => {



    bot.use(Mdlw.auth);

    bot.start((ctx) => {
        return ctx.reply(msg);
    });


    bot.command('help', Routes.help);
    bot.command('alarm', Routes.alarm);
    bot.command("ambiance",Routes.ambiance);
    bot.command("report",Routes.report);
    bot.command("chart",Routes.chart);


    bot.startPolling();

}; */








