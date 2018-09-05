const MQTT = require("async-mqtt");
const AES = require("../security/aes");
const Topics=require("./topicList");


const mqtt = () => {

    let clientRef;
    let callback;
    const internals = {};
    const client = { connected: false };
    const aes = AES.createAES128Cipher(process.env.PRIVATE_KEY);

    const onMsg = (topic, message) => {

        try {
            let msg = aes.decrypt(message.toString());
            msg = JSON.parse(msg);
            console.log(topic, msg);
            callback(topic, msg);
        } catch (error) {
            console.error(error.stack)
        }
    };


    client.setMessageCallback = (cb) => {
        callback = cb;
    };

    // returns promise
    client.subscribe = (topic) => {
        return clientRef.subscribe(topic);
    };

    // returns promise
    client.publish = (topic, message) => {
        try {
            let msg = JSON.stringify(message);
            msg = aes.encrypt(msg);
            return clientRef.publish(topic, msg);
        } catch (error) {
            console.log(error.stack);
        }
    };



    internals.connect=({ clientId, keepalive=1200 })=>{

        return new Promise((resolve, reject) => {

            try {

                clientRef = MQTT.connect(process.env.MQTT_BROKER, { clientId, keepalive });

                clientRef.on('message', onMsg);

                clientRef.on("connect", () => {
                    client.connected = true;
                    console.log("MQTT client has connected to broker!");
                });

                clientRef.on("error", (error) => {
                    reject(error);
                });

                resolve(client);

            } catch (error) {
                reject(error);
            }

        });
    };

    internals.getClient=()=>{
        return client;
    };

    internals.topics=Topics.getMqttTopicNames();



    return internals;
};



module.exports = mqtt();