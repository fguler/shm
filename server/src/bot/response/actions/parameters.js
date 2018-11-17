const Parameter=require("../../../models/parameter");


const checkTimeOrder=(start,end)=>{

};


module.exports=()=>{

    const nightModeTimeChange=async (ctx,result)=>{

        ctx.reply(result.fulfillmentText);

        let startTime=result.parameters.fields.startTime.numberValue;
        let endTime=result.parameters.fields.endTime.numberValue;

        const param=await Parameter.findOne({}).exec();
        
        param.nightModeTimeRange.start=startTime;
        param.nightModeTimeRange.end=endTime;

        await param.save();
        
        ctx.reply("Done!");
    
    };
    

    return {
        night_mode_time_change:nightModeTimeChange
    };

};