const Parameter = require("../../models/parameter");


const activateAlarm = async () => {

    let msg = "The alarm has been activated!";

    await Parameter.updateOne({}, { isAlarmActivated: true }).exec();
    return msg;

};


const deactivateAlarm = async () => {

    let msg = "The alarm has been deactivated!";

    await Parameter.updateOne({}, { isAlarmActivated: false }).exec();
    return msg;
};

const actions = {};
actions["on"] = activateAlarm;
actions["off"] = deactivateAlarm;



module.exports = () => {
    return {
        getAlarmActions() {
            return actions;
        }
    }
};