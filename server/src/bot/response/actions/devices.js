const MQTT=require("../../../mqtt");

module.exports=()=>{
    const topics = MQTT.topics.publishing

    const livingRoomLampOn=async (ctx,result)=>{
        await ctx.reply("Just a second...");
        const client=MQTT.getClient()
        let msg={"status":true};
        await client.publish(topics.LIVING_ROOM_LAMP,msg)
        await ctx.reply(result.fulfillmentText);

    };

    const livingRoomLampOff=async (ctx,result)=>{
        await ctx.reply("Just a second...");
        const client=MQTT.getClient()
        let msg={"status":false};
        await client.publish(topics.LIVING_ROOM_LAMP,msg)
        await ctx.reply(result.fulfillmentText);   
    };
    

    return {
        living_room_lamp_on:livingRoomLampOn,
        living_room_lamp_off:livingRoomLampOff

    };
};