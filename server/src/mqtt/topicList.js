

const list={
    LIVING_ROOM_LAMP:`${process.env.MQTT_APP_ID}/devices/LRoomLamp`,
    DEVICES_CHECK_IN:`${process.env.MQTT_APP_ID}/devices/checkIn`

};


module.exports={
    getMqttTopicNames(){
        return list;
    }
}