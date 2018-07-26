const Handlers=require("../actionHandlers");


module.exports=()=>{

    const actions=Handlers.getReportActions();


    const createSystemReport=async(ctx,result)=>{

        ctx.reply(result.fulfillmentText);
        let report=await actions.systemReport();
        return ctx.reply(report);
    };


    return {
        system_report:createSystemReport
    }

};