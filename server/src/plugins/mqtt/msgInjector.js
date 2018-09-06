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
            if (!message.id) { // every message must have a device id
                throw new Error("Message does no have a device Id!");
            }
            const dev = await Device.findOne({ deviceId: message.id }).exec();
            if (!dev) {
                throw new Error("Device Id in the message is unknown!");
            }

            if (topic.includes("/")) {
                let url = "/api" + topic.slice(topic.indexOf("/"));
                injOptions.url = url;
                injOptions.payload = message
                await server.inject(injOptions);
            }

        } catch (error) {
            console.log(error.stack)
        }
    };

    // connect to MQTT broker
    const client = await MQTT.connect({ clientId: process.env.MQTT_CLIENT_ID });
    client.setMessageCallback(onMessage)

    // subscribe topics
    const subTopics = MQTT.topics.subscribing
    for (let t in subTopics) {
        await client.subscribe(subTopics[t])
    }


    //await client.subscribe(MQTT.topics.DEVICES_CHECK_IN);
    //await client.subscribe(MQTT.topics.DEVICES_AMBIANCE_VALUES);
    //await client.subscribe(MQTT.topics.DEVICES_GAS_ALERT);


    //let msg = { status: false }
    //await client.publish(`${process.env.MQTT_APP_ID}/devices/LRoomLamp`, msg);


};

const plugin = {
    name: "MQTTMessageInjector",
    register

}

module.exports = plugin;