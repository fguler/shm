const Handlers=require("../actionHandlers");


module.exports=()=>{

    const actions=Handlers.getAlarmActions();

    const turnOffAlarm=async(ctx,result)=>{
        await actions.turnOffAlarm();
        return ctx.reply(result.fulfillmentText);
    };

    const turnOnAlarm=async(ctx,result)=>{
        await actions.turnOnAlarm();
        return ctx.reply(result.fulfillmentText);
    };


    return {
        alarm_off:turnOffAlarm,
        alarm_on:turnOnAlarm
    }

};