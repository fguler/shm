const Actions = require("./routeActions");


// helper function to extract command and argument
extractCommArgument = (msg) => {
    //TODO : Birden fazla argument döncek şekilde modifiye et
    let commAndArg = msg.split(" ");

    let comm = commAndArg[0];
    let arg = "";

    if (commAndArg[1]) {
        arg = commAndArg[1];
        arg = arg.trim();
    }

    return [comm, arg];
};



module.exports = () => {


    // route for help
    const help = (ctx) => {

        let msg = "Commands you can use are:\n" +
            "\/ambiance\n\/alarm [on,off]\n\/foto\n\/report";

        return ctx.reply(msg);
    };


    // route form alarm
    const alarm = async (ctx) => {

        let comm, arg;

        try {
            [comm, arg] = extractCommArgument(ctx.message.text);

            const actions = Actions.getAlarmActions();
            let action = actions[arg];

            if (!action) {
                return ctx.reply(`${comm} you must define your action after putting a space after this command.`);
            }

            let response=await action();

            ctx.reply(response);
            
        } catch (error) {
            ctx.reply("An error occured!");      
        }
 
    };

    // route for ambiance values
    const ambiance = async (ctx) => {

        const actions = Actions.getAmbianceActions();

        try {
            let response=await actions.getLastAmbianceRecord();
            ctx.reply(response);      
        } catch (error) {
            ctx.reply("An error occured!");
        }
    
    };

    const report = async (ctx) => {
        const actions = Actions.getReportActions();

        try {
            let response=await actions.generalReport();
            ctx.reply(response);     
        } catch (error) {
            ctx.reply("An error occured!");
        }

    };

    const chart = (ctx) => {
        //ctx.replyWithPhoto('https://picsum.photos/200/300/');
        const actions = Actions.getChartActions();
        
        ctx.reply("Ok, just a second.");

        actions.createTempAndHumChart().then((stream) => {
            ctx.replyWithPhoto({ source: stream });
        }).catch((err) => {
            ctx.reply("An error occured!");
        });

    };



    return { help, alarm, ambiance, report, chart };


};