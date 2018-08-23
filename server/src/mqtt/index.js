const MQTT = require("async-mqtt");
const AES=require("../security/aes");


const mqtt=()=>{

    let clientRef;
    let callback;
    const aes=AES.createAES128Cipher(process.env.PRIVATE_KEY);

    const onMsg=(topic, message)=>{

        try {       
            let msg=aes.decrypt(message.toString());
            msg=JSON.parse(msg);
            callback(topic,msg);
        } catch (error) {
            console.log(error);         
        }
    };

    const client={connected:false};

    client.setMessageCallback=(cb)=>{
        callback=cb;
    };

    client.subscribe=(topic)=>{
        return clientRef.subscribe(topic);
    };

    client.publish=(topic, message)=>{
        try {
            let msg=JSON.stringify(message);
            msg=aes.encrypt(msg);
            return clientRef.publish(topic, msg);         
        } catch (error) {
            console.log(error);          
        }
    };


    return {

        connect({clientId,keepalive=1200}){

            return new Promise((resolve,reject)=>{

                try {

                    clientRef = MQTT.connect("mqtt://iot.eclipse.org",{clientId,keepalive});

                    clientRef.on('message',onMsg);

                    clientRef.on("connect",()=>{
                        client.connected=true;
                        console.log("MQTT client has connected to broker!");
                    });
                    
                    clientRef.on("error",(error)=>{
                        reject(error);
                    });

                    resolve(client);

                } catch (error) {
                    reject(error);
                }

            });
        },
        getClient(){
            return client;
        }

    }
};



module.exports=mqtt();