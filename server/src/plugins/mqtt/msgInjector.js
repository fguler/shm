const Joi = require('joi');
const MQTT = require("../../mqtt");
const Device = require("../../models/device");

// this plugin connects to MQTT broker, subscribes the topics and 
// injects incoming messages into server
const register = async function (server, options) {

    // injects incoming messages into server
    const onMessage = async (topic, message) => {
        
        injOptions = {
            url: "",
            method: "POST",
            payload: {}
        };

        try {
            if (message.id) { // every message must have a device id

                const dev = await Device.findOne({ deviceId: message.id }).exec();
                if (!dev) {
                    return;
                }

                if (topic.includes("/")) {
                    let url = "/api" + topic.slice(topic.indexOf("/"));
                    injOptions.url = url;
                    injOptions.payload = message
                    await server.inject(injOptions);
                }

            }

        } catch (error) {
            console.error(error.stack)
        }
    };

    // connect to MQTT broker
    const client = await MQTT.connect({ clientId: process.env.MQTT_CLIENT_ID });
    client.setMessageCallback(onMessage)

    // subscribe messages
    await client.subscribe(`${process.env.MQTT_APP_ID}/devices/checkIn`);

    //let msg = { status: false }
    //await client.publish(`${process.env.MQTT_APP_ID}/devices/LRoomLamp`, msg);


};

const plugin = {
    name: "MQTTMessageInjector",
    register

}

module.exports = plugin;