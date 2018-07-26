process.env["NODE_CONFIG_DIR"] = "../../../" + "/config/";
const Mongoose = require('mongoose');
const Config = require('config');
const Parameter = require("../../models/parameter");


// Use native promises
Mongoose.Promise = global.Promise;

const main = async () => {

    //connect to mongoDB
    await Mongoose.connect(Config.get('mongoDB.url'))
        .then(() => console.log("MongoDB Connected..."));


};


main().then(() => {
    console.log("Finished...")
    process.exit(0);
}).catch((err) => {
    console.log(err);
    process.exit(1);
});