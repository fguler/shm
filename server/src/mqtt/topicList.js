

const subscribing={
    LIVING_ROOM_LAMP:`${process.env.MQTT_APP_ID}/devices/LRoomLamp`,
    DEVICES_CHECK_IN:`${process.env.MQTT_APP_ID}/devices/checkIn`,
    DEVICES_AMBIANCE_VALUES:`${process.env.MQTT_APP_ID}/devices/ambiance`,
    DEVICES_GAS_ALERT:`${process.env.MQTT_APP_ID}/devices/gasAlert`
};

const publishing={

};



module.exports={
    getMqttTopicNames(){
        return {
            subscribing,
            publishing
        };
    }
}