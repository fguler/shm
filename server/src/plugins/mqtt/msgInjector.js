const Joi = require('joi');
const MQTT = require("../../mqtt");

// this plugin connects to MQTT broker and injects incoming messages into server
const register = async function (server, options) {


    const onMessage = (topic, message) => {

        console.log(topic, message);

    };

    // connect to MQTT broker
    const client = await MQTT.connect({ clientId: process.env.MQTT_CLIENT_ID });
    client.setMessageCallback(onMessage)

    // subscribe messages
    await client.subscribe(`${process.env.MQTT_APP_ID}/devices/checkIn`);

    let msg = { status: false }
    await client.publish(`${process.env.MQTT_APP_ID}/devices/LRoomLamp`, msg);


};

const plugin = {
    name: "MQTTMessageInjector",
    register

}

module.exports = plugin;