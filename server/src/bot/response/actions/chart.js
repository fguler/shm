const Handlers=require("../actionHandlers");


module.exports=()=>{

    const actions=Handlers.getChartActions();


    const createTempAndHumChart=async(ctx,result)=>{

        ctx.reply(result.fulfillmentText);
        let stream=await actions.createHourlyTempAndHumChart();
        return ctx.replyWithPhoto({ source: stream });
    };


    return {
        temp_chart:createTempAndHumChart
    }

};