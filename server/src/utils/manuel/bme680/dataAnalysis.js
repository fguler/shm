const Path = require("path");
require('dotenv').config({ path: Path.resolve("../../../../.env") });
const Mongoose = require('mongoose');
const AmbValuesM = require("../../../models/ambiance")
const Utils = require("../../utils");
const FS = require("fs");
var CSV = require("fast-csv");

//return console.log(process.env.MONGODB_MLAP_URL);

// Use native promises
Mongoose.Promise = global.Promise;


const getDataFromDb = (limit) => {

    return AmbValuesM.find().
        sort({ _id: -1 }).
        limit(limit).exec();
};

// turn mongoose objects to plain js objects
const normalizeObject = (doc) => {
    let { id, temp, hum, air, hpa, gas, createdAt } = doc;
    let [date, time] = Utils.dateFromString(createdAt).split("-");
    time = time.trim();
    date = date.trim();
    return { id, temp, hum, air, gas, hpa, date, time };
};

//write data to csv file
const jsonToCsv = (data) => {

    return new Promise((resolve, reject) => {
        const ws = FS.createWriteStream("./bme680.csv");

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


// main function
const main = async () => {

    //connect to mongoDB
    await Mongoose.connect(process.env.MONGODB_MLAP_URL)
        .then(() => console.log("MongoDB Connected..."));

    let data = await getDataFromDb(100);
    data = data.map((doc) => normalizeObject(doc));

    await jsonToCsv(data);
};


main().then(() => {
    console.log("Finished...")
    process.exit(0);
}).catch((err) => {
    console.log(err);
    process.exit(1);
});
