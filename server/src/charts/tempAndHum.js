const ChartConfig = require("./chartConfigs/tempAndHum_c");
const puppeteer = require('puppeteer');
const Utils = require("../utils/utils");
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


const prepareChartData = (timeRange, records) => {

    const labelsAndData = {
        chartName: "NaN",
        labelDefinition: "NaN",
        temp: {
            labels: [],
            data: []
        },
        hum: {
            labels: [],
            data: []
        }
    };

    const mapTemp = new Map();
    const mapHum = new Map();


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
        let { temp, hum, createdAt } = doc;
        let label;

        // decide label category
        if (timeRange == timeRangeOptions.HOURLY) {
            label = new Date(createdAt).getHours("tr-TR", { hour12: false }); // label is hour
        }else if(timeRange == timeRangeOptions.WEEKLY){
            label=Moment(createdAt).isoWeek(); // label is week
        }

        // add values to maps
        if (mapTemp.has(label)) {
            // temp values
            let valTemp = mapTemp.get(label);
            valTemp.push(parseInt(temp));
            mapTemp.set(label, valTemp);

            // hum values
            let valHum = mapHum.get(label);
            valHum.push(parseInt(hum));
            mapHum.set(label, valHum);

        } else {
            mapTemp.set(label, [parseInt(temp)]); // add label value to Map with firs value
            mapHum.set(label, [parseInt(hum)]); // add label value to Map with firs value
        }


    });

    //turn maps into label and data arrays form compatible with by Chart.js
    let { labels, data } = labelsAndDataFromMap(mapTemp);
    labelsAndData.temp.labels = [...labels];
    labelsAndData.temp.data = [...data];

    ({ labels, data } = labelsAndDataFromMap(mapHum));
    labelsAndData.hum.labels = [...labels];
    labelsAndData.hum.data = [...data];


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

const createChart = async ({chartData,htmlFilePath,tmpPath}) => {

    //const browser = await puppeteer.launch({ headless: true });

    // executablePath is necessary on raspberry pi
    const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium-browser' });
    const page = await browser.newPage();

    await page.goto(htmlFilePath);

    let config = ChartConfig(chartData);

    // pass chart config to the page
    await page.evaluate((args) => {
        drawChart(args);
    }, { config });

    await Utils.sleep(1000);
    const outputPath = tmpPath + 'tempAndHum.png';

    await page.screenshot({ path: outputPath });

    await browser.close();

    return outputPath;

};


module.exports = ({ htmlFilePath, tmpPath }) => {


    // Temperature and Humudity result of last 12 hours
    const hourlyTempAndHum = async () => {

        let records = await getRecordsfromDB(timeRangeOptions.HOURLY);
        const chartData = prepareChartData(timeRangeOptions.HOURLY, records);
        chartData.chartName = "Last 12 Hours Temperature and Humidity";

        const chartPath = await createChart({chartData,htmlFilePath,tmpPath});

        return chartPath;

    };


    // Temperature and Humudity result of last 4 weeks
    const weeklyTempAndHum = async () => {

        let records = await getRecordsfromDB(timeRangeOptions.WEEKLY);
        const chartData = prepareChartData(timeRangeOptions.WEEKLY, records);
        chartData.chartName = "Last 4 Weeks Temperature and Humidity";

        const chartPath = await createChart({chartData,htmlFilePath,tmpPath});

        return chartPath;

    };


    return {
        getTempAndHumChart(){
            return {
                hourlyTempAndHum,
                weeklyTempAndHum,
                timeRangeOptions
        
            };

        }
    };



}