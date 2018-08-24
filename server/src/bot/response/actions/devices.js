const MQTT=require("../../../mqtt");

module.exports=()=>{

    const internal={};

    internal.living_room_lamp_on=async (ctx,result)=>{
        const client=MQTT.getClient()
        let msg={"status":true};
        await client.publish(MQTT.topics.LIVING_ROOM_LAMP,msg)
        return ctx.reply(result.fulfillmentText);

    };

    internal.living_room_lamp_off=async (ctx,result)=>{
        const client=MQTT.getClient()
        let msg={"status":false};
        await client.publish(MQTT.topics.LIVING_ROOM_LAMP,msg)
        return ctx.reply(result.fulfillmentText);   
    };

    return internal;
};