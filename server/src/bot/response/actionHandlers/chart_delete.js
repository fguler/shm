const Charts = require("../../../charts");
const FS = require("fs");

module.exports = () => {

    const createHourlyTempAndHumChart = async () => {

        const chart=Charts.getTempAndHumChart();

        let filePath = await chart.hourlyTempAndHum();
        return FS.createReadStream(filePath);

    };
    
    const createWeeklyTempAndHumChart = async () => {

        const chart=Charts.getTempAndHumChart();

        let filePath = await chart.weeklyTempAndHum();
        return FS.createReadStream(filePath);

    };


    return {
        getChartActions() {
            return {
                createHourlyTempAndHumChart,
                createWeeklyTempAndHumChart
            };
        }

    };
};