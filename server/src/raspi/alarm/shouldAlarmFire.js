const Parameter = require("../../models/parameter");
const Utils=require("../../utils/utils");



const shouldAlarmFire = async () => {

    let { areUsersAtHome, isAlarmActivated, nightModeTimeRange } = await Parameter.findOne().exec();

    let isNightModeActive = Utils.isHourInPeriod(nightModeTimeRange.start, nightModeTimeRange.end);


    if (isNightModeActive) {
        return true;
    } else if (isAlarmActivated && areUsersAtHome) {
        return false;
    } else if (!isAlarmActivated) {
        return false;
    } else {
        return true;
    }

}

module.exports = () => {
    return {
        shouldAlarmFire
    };
};