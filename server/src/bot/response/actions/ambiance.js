const Handlers=require("../actionHandlers");


module.exports=()=>{

    const actions=Handlers.getAmbianceActions();


    const getAmbianceValues=async(ctx,result)=>{

        ctx.reply(result.fulfillmentText);
        let values=await actions.getLastAmbianceRecord();
        return ctx.reply(values);
    };


    return {
        ambiance_values:getAmbianceValues
    }

};