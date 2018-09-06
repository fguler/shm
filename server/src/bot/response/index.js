const Dialogflow=require("../../dialogflow");
const Actions=require("./actions");


const process=async(ctx)=>{

    
    try {
        //return ctx.reply(ctx.message.text);
        
        const dialogflow=new Dialogflow(ctx.message.from.id)

        let result = await dialogflow.detectIntent(ctx.message.text);

        let actionName=result.action;
        let allRequiredParamsPresent=result.allRequiredParamsPresent;
   
        actionName=Actions[actionName];// check if we are interested in this action

        if(!actionName || !allRequiredParamsPresent){
            await ctx.reply(result.fulfillmentText);
            return;
        }

        await actionName(ctx,result) // if the action is in our list, then allow it to handle the response

        
    } catch (error) {
        console.log(error)
        await ctx.reply("Sorry, something went wrong 😢");
    }

};

module.exports={
    process
};


// smile "😄"