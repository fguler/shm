const Telegraf = require('telegraf');
const Mdlw = require("./middlewares");
const OutgoingActions=require("./outgoingActions/index")
const Response=require("./response/");


const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

const start = () => {

    bot.use(Mdlw.auth);

    bot.on('text', Response.process)

    bot.startPolling();

};




module.exports=Object.assign({},{start},OutgoingActions(bot));



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








