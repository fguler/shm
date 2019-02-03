
const Moment = require("moment");
const Bot = require("../../bot/bot");
const Alarm = require("../../raspi/alarm/alarm");
const TwinInterface = require("../twinInterface");


const envSensor = (name) => {

    const timePeriodForAlarm = (5 * 60000); //5 minutes in miliseconds
    const airQualityThreshold = 30;
    let lastTimeAlarmFired = 0;
    let lastTimeWarningSent = 0;
    const postUpdateFunctions = {};

    const state = {
        features: {
            temp: 0,
            gas: 0,
            hpa: 0,
            hum: 0,
            air: 0
        },
        twinName: ""
    };

    state.twinName = name;

    state.runPostUpdateFunctions = async () => {

         for (let fName in postUpdateFunctions) {

            let isPromise = postUpdateFunctions[fName]();

            if (isPromise && isPromise instanceof Promise) {
                await isPromise;
            }

        }
    };


    postUpdateFunctions.shouldAlarmFire = async () => {
        // Alarm can be fired every 5 minutes depending on air quality
        if ((Date.now() >= lastTimeAlarmFired) && (state.features.air <= airQualityThreshold)) {

            console.log("Gas alert was received!");
            let msg = "Attention! Air quality is so low, check the house!!!";

            try {
                let alarmFire = await Alarm.shouldAlarmFire();

                if (alarmFire) {
                    await Bot.sendMessageToAllUsers(msg);
                    await Alarm.fire();
                    lastTimeAlarmFired = (timePeriodForAlarm + Date.now());
                }

            } catch (error) {
                console.log(error)
            }

        }

    };

    postUpdateFunctions.shouldSendWarning = async () => {

        if ((Date.now() >= lastTimeWarningSent) && (state.features.air <= 50)){

            let msg = "Air quality has dropped significantly, check the house!";

            try {

                await Bot.sendMessageToAllUsers(msg);
                lastTimeWarningSent = (timePeriodForAlarm + Date.now());

                console.log("Air quality warning has been sent!");

            } catch (error) {
                console.log(error)
            }
        }

    };

    return { ...TwinInterface.implement(state) };


    /*     const setFeatures = (features) => {
            for(i in state.features){
                state.features[i]=features[i];
            }
            shouldAlarmFire(state.features.air);
        };
    
        const getFeatures = () => {
            return { ...state.features };
        };
    
        const setName = (name) => {
            state.twinName = name;
        };
    
        const getName = () => {
            return state.twinName;
        };
    
    
    
        return {
            setFeatures,
            setName,
            getName,
            getFeatures
    
        };
     */


};

module.exports = {
    create(name) {
        return envSensor(name);
    }
};















/*
const internals={};

const feature=(model,state)=>{

    return {
        saveFeatureToDB(){

        },
        setFeatures(data){

        }
    };
}; */












