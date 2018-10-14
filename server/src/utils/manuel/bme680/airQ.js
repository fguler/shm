const Path = require("path");
require('dotenv').config({ path: Path.resolve("../../../../.env") });
const Mongoose = require('mongoose');
const AmbianceModel = require("../../../models/ambiance")
const Utils = require("../../utils");
const FS = require("fs");
var CSV = require("fast-csv");
const Moment = require("moment");

//return console.log(process.env.MONGODB_MLAP_URL);

// Use native promises
Mongoose.Promise = global.Promise;



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

        labelsAndData.data.push(parseInt(sum / valArray.length)); // calculate avarage value for the label
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
        } else if (timeRange == timeRangeOptions.WEEKLY) {
            label = Moment(createdAt).isoWeek(); // label is week
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



const jsonToCsv = (data) => {

    return new Promise((resolve, reject) => {
        const ws = FS.createWriteStream("./air.csv");

        try {
            // pipe returns the destination stream
            CSV.write(data, { headers: true }).pipe(ws).on("finish", () => {
                console.log("The CSV file has been crated.");
                resolve(true);
            });

        } catch (err) {
            reject(err)
        }

    });

};

const main = async () => {

    //connect to mongoDB
    await Mongoose.connect(process.env.MONGODB_MLAP_URL)
        .then(() => console.log("MongoDB Connected..."));

    console.log("kkk");
    let records = await getRecordsfromDB(timeRangeOptions.HOURLY);
    const chartData = prepareChartData(timeRangeOptions.HOURLY, records);


    await jsonToCsv([chartData.air]);
};

main().then(() => {
    console.log("Finished...")
    process.exit(0);
}).catch((err) => {
    console.log(err);
    process.exit(1);
});

