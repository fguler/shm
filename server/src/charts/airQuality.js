const ChartConfig = require("./chartConfigs/airQuality_c");
//const puppeteer = require('puppeteer');
const Pupp=require("./puppeteer");
//const Utils = require("../utils/utils");
const AmbianceModel = require("../models/ambiance");
const Moment = require("moment");

const timeRangeOptions = {
    HOURLY: "hourly", // last 12 hours
    WEEKLY: "weekly", // last 4 week
    MONTHLY: "monthly" // last 6 month
};

const labelsAndDataFromMap = (map) => {
    const labelsAndData = {
        labels: [],
        data: []
    };
    // this is necessary because we might have two values corresponding to one label
    map.forEach((valArray, label) => {
        labelsAndData.labels.push(label);

        let sum = valArray.reduce((sum, val) => sum + val, 0); // sum up all values inside the array

        labelsAndData.data.push(Math.round(sum / valArray.length)); // calculate avarage value for the label
    });


    return labelsAndData;
};

// fetch docs from mongoDB
const getRecordsfromDB = async (timeRange) => {
    let date, records;

    if (!timeRange) {
        throw Error("[timeRange] argument is required in [getRecordsfromDB] function");
    }

    // calculate the time range to query database
    switch (timeRange) {

        case timeRangeOptions.HOURLY:
            date = new Date(Moment().subtract(12, 'hours').toISOString()); // go back 12 hours in time
            break;
        case timeRangeOptions.WEEKLY:
            date = new Date(Moment().subtract(4, 'weeks').toISOString());
            break;

        default:
            throw Error("Unknown [timeRange] in [getRecordsfromDB] function");
    }

    records = await AmbianceModel.find().sort({ _id: 1 })
        .where("createdAt").gte(date).exec(); // get latest records

    return records;

};

const prepareChartData = (timeRange, records) => {

    const labelsAndData = {
        chartName: "NaN",
        labelDefinition: "NaN",
        air: {
            labels: [],
            data: []
        }
    };

    const mapAir = new Map();
 
    switch (timeRange) {

        case timeRangeOptions.HOURLY:
            labelsAndData.labelDefinition = "Hours";
            break;
        case timeRangeOptions.WEEKLY:
            labelsAndData.labelDefinition = "Weeks";
            break;

        default:
            throw Error("Unknown [timeRange] in [prepareChartData] function");
    }

    // loop docs coming from mongoDB
    records.forEach(doc => {
        let { air, createdAt } = doc;
        let label;

        // decide label category
        if (timeRange == timeRangeOptions.HOURLY) {
            label = new Date(createdAt).getHours("tr-TR", { hour12: false }); // label is hour
        }else if(timeRange == timeRangeOptions.WEEKLY){
            label=Moment(createdAt).isoWeek(); // label is week
        }

        // add values to maps
        if (mapAir.has(label)) {
            let valAir = mapAir.get(label); // get the value which is an array
            valAir.push(parseInt(air));
            mapAir.set(label, valAir);

        } else {
            mapAir.set(label, [parseInt(air)]); // add label value to Map with firs value
        }
    });

    //turn maps into label and data arrays form that is compatible with by Chart.js
    let { labels, data } = labelsAndDataFromMap(mapAir);
    labelsAndData.air.labels = [...labels];
    labelsAndData.air.data = [...data];

    return labelsAndData;

};

/* const createChart = async ({chartData,htmlFilePath,tmpPath}) => {

    const browser="";
    const environment = process.env.NODE_ENV;

    if(environment=="development"){
        browser = await puppeteer.launch({ headless: true });
    }else{
        // executablePath is necessary on raspberry pi
        browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium-browser' });
    }

    const page = await browser.newPage();

    await page.goto(htmlFilePath);

    let config = ChartConfig(chartData);

    // pass chart config to the page
    await page.evaluate((args) => {
        drawChart(args);
    }, { config });

    await Utils.sleep(1000);
    const outputPath = tmpPath + 'airQuality.png';

    await page.screenshot({ path: outputPath });

    await browser.close();

    return outputPath;

}; */

module.exports = ({ htmlFilePath, tmpPath }) => {
    // Air Quality chart of last 12 hours
    const hourlyAirQuality = async () => {

        let records = await getRecordsfromDB(timeRangeOptions.HOURLY);
        const chartData = prepareChartData(timeRangeOptions.HOURLY, records);
        chartData.chartName = "Last 12 Hours Air Quality";

        const config = ChartConfig(chartData);
        const outputPath = tmpPath + 'airQuality.png';

        const chartPath=Pupp.createChart({config,htmlFilePath,outputPath})


        //const chartPath = await createChart({chartData,htmlFilePath,tmpPath});

        return chartPath

    };

    return {
        getAirQualityChart(){
            return {
                timeRangeOptions,
                hourlyAirQuality      
            };

        }
    };

};