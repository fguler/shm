const Charts = require("../../../charts");
const FS = require("fs");


module.exports = () => {


    const createTempAndHumChart = async (ctx, result) => {
        let filePath, stream;

        const chart = Charts.getTempAndHumChart();

        const timeRangeOptions = chart.timeRangeOptions;

        ctx.reply(result.fulfillmentText);

        // check entity name from diaglogflow
        let {chart_periods}=result.parameters.fields;
        
        switch (chart_periods.stringValue) {

            case timeRangeOptions.HOURLY:
                filePath = await chart.hourlyTempAndHum();
                console.log(filePath);
                stream = FS.createReadStream(filePath);
                break;

            case timeRangeOptions.WEEKLY:
                filePath = await chart.weeklyTempAndHum();
                stream = FS.createReadStream(filePath);
                break;
        }

        return ctx.replyWithPhoto({ source: stream });

    };


    return {
        temp_chart: createTempAndHumChart
    }

};