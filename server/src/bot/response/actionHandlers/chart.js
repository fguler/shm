const Charts = require("../../../charts");
const FS=require("fs");

module.exports = () => {
    
    const createHourlyTempAndHumChart = async () => {

        try {

            let filePath=await Charts.hourlyTempAndHum();
            return FS.createReadStream(filePath);
            
        } catch (err) {
            throw new Error("Sorry, an error has occured.")
        }

    };


    return {
        getChartActions(){
            return {
                createHourlyTempAndHumChart
            };
        }

    };
};