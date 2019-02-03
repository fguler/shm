const MQTT = require("mqtt");
const AES = require("../security/aes");
const Topics = require("./topicList");


let clientRef;
let callback;
const internals = {};
const client = { connected: false };
const aes = AES.createAES128Cipher(process.env.PRIVATE_KEY);

const onMsg = (topic, message) => {

    try {
        let msg = aes.decrypt(message.toString());
        msg = JSON.parse(msg);
        callback(topic, msg);
    } catch (error) {
        console.log(error.stack)
    }
};


client.setMessageCallback = (cb) => {
    callback = cb;
};


client.subscribe = (topic) => {

    return new Promise((resolve,reject)=>{

        try {
            clientRef.subscribe(topic,(err)=>{
                if(err){
                    throw err
                }
                resolve(true);
            });
            
        } catch (error) {
            reject(error)
        }

    });
};


client.publish = (topic, message) => {

    return new Promise((resolve,reject)=>{

        try {
            if(!topic || !message){
                throw new Error("Topic or message can't be undefined when publishing to MQTT broker!");
            }

            let msg = JSON.stringify(message);
            msg = aes.encrypt(msg);

            clientRef.publish(topic, msg,(err)=>{
                if(err){
                    console.log(err);
                    throw err;
                }
            });
            
            resolve(true);
        } catch (error) {
            reject(error)
        }

    });

};


internals.connect = ({ clientId, keepalive = 1200 }) => {

    return new Promise((resolve, reject) => {

        try {

            clientRef = MQTT.connect(process.env.MQTT_BROKER, { clientId, keepalive });

            clientRef.on('message', onMsg);

            clientRef.on("connect", () => {
                client.connected = true;
                console.log("MQTT client has connected to broker!");
            });

            clientRef.on("close", () => {
                client.connected = false;
            });

            clientRef.on("error", (error) => {
                client.connected = false;
                console.log(error)
            });

            resolve(client);

        } catch (error) {
            reject(error);
        }

    });
};

internals.getClient = () => {
    return client;
};


internals.topics = Topics.getMqttTopicNames(); 




module.exports = internals