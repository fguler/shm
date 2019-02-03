const Mongoose = require('mongoose');
const Moment = require("moment");



const timePeriodForSaving = (15 * 60000); //fifteen minutes in miliseconds
let nextSavingTime = 0;



const Schema = Mongoose.Schema;


const ambianceSchema = Schema({
    temp: { type: Number, default: 1 },
    hum: { type: Number, default: 1 },
    gas: { type: Number, default: 1 },
    air: { type: Number, default: 1 },
    hpa: { type: Number, default: 1 },
    createdAt: { type: Date, default: () => new Date() }
});


ambianceSchema.pre('save', async function () {
    nextSavingTime = (timePeriodForSaving + Date.now()); // values saved every 15 minutes
});

// air quality is calculated below based on average of last 3 days' gas values
ambianceSchema.methods.calculateAirQuality = async function () {

    let avgGasVal = 0;

    try {
        let date = new Date(Moment().subtract(3, "days").toISOString());

        let qry = await this.model("AmbianceValue").aggregate([
            { $match: { createdAt: { $gte: date } } },
            { $group: { _id: null, avg: { $avg: "$gas" } } }
        ]);

        if (qry.length > 0) {
            avgGasVal = Math.round(qry[0].avg);
        } else {
            this.air = 99; // if there is no previous gas data
        }

        if (this.gas >= avgGasVal) {
            this.air = 99;
        } else {
            let airVal = ((this.gas / avgGasVal) * 100);
            airVal = Math.floor(airVal);
            this.air = airVal;
        }

    } catch (error) {
        console.log(error)
    }

};



ambianceSchema.methods.isItTimeToSave = function () {

    if (Date.now() >= nextSavingTime) {
        return true;
    }
    return false;
};


module.exports = Mongoose.model("AmbianceValue", ambianceSchema);


/* const calculateAirQuality = async (model, gas) => {

    let avgGasVal = 0;
    let airVal = 0;

    try {
        let date = new Date(Moment().subtract(3, "days").toISOString());

        let qry = await model.aggregate([
            { $match: { createdAt: { $gte: date } } },
            { $group: { _id: null, avg: { $avg: "$gas" } } }
        ]);

        if (qry.length > 0) {
            avgGasVal = Math.round(qry[0].avg);
        } else {
            throw new Error("No previous gas data");
        }

        if (gas >= avgGasVal) {
            airVal = 99;
        } else {
            airVal = ((gas / avgGasVal) * 100);
            airVal = Math.floor(airVal);
        }

    } catch (error) {
        airVal = 0;
        console.log(error);
    }

    return airVal;

}; */