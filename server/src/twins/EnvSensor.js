
const Moment = require("moment");




const envSensor = () => {

    const timePeriodForDBSaving=(15*60000); //fifteen minutes in miliseconds

    const state = {
        features: {
            temp: 0,
            gas: 0,
            hpa: 0,
            hum: 0,
            air: 0
        },
        twinName:""
    };

    const setFeatures = ({temp=0,gas=0,hpa=0,hum=0,air=0}) => {
        state.features = {temp=0,gas=0,hpa=0,hum=0,air=0};
    };

    const setName = (name) => {
        state.twinName = name;
    };

    const shouldAlarmFire = () => {

    };

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












