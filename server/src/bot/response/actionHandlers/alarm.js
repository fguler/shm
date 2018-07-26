const Parameter = require("../../../models/parameter");


const turnOnAlarm = async () => {

    let msg = "";

    await Parameter.updateOne({}, { isAlarmActivated: true }).exec();
    return msg;

};


const turnOffAlarm = async () => {

    let msg = "";

    await Parameter.updateOne({}, { isAlarmActivated: false }).exec();
    return msg;
};



const actions = {
    turnOnAlarm,
    turnOffAlarm
};


module.exports = () => {
    return {
        getAlarmActions() {
            return actions;
        }
    }
};