const Parameter = require("../../models/parameter");

module.exports = () => {


    const generalReport = async () => {

        let { areUsersAtHome,
            isAlarmActivated,
            nightModeTimeRange
        } = await Parameter.findOne({}).exec();

        return `Residents are ${areUsersAtHome ? "-at home-" : "-not at home-"}\n` +
            `Alarm is ${isAlarmActivated ? "-activated-" : "-not activated-"}\n`+
            `Night mode is between ${nightModeTimeRange.start} and ${nightModeTimeRange.end}.`
    };


    return {

        getReportActions() {
            return {
                generalReport
            };
        }
    }



};