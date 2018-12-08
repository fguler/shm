const Mongoose = require('mongoose');
const Moment = require("moment");

const Schema = Mongoose.Schema;


const ambianceSchema = Schema({
    temp: { type: Number, default: 1 },
    hum: { type: Number, default: 1 },
    gas: { type: Number, default: 1 },
    air: { type: Number, default: 1 },
    hpa: { type: Number, default: 1 },
    createdAt: { type: Date, default: () => new Date() }
});



// air quality is calculated below based on average of last 3 days' gas values
ambianceSchema.pre('save', async function () {
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
            throw new Error("No previous gas data");
        }

        if (this.gas >= avgGasVal) {
            this.air = 99;
        } else {
            let airVal = ((this.gas / avgGasVal) * 100);
            airVal = Math.floor(airVal);
            this.air = airVal;
        }

    } catch (error) {
        this.air = 0;
    }

});


module.exports = Mongoose.model("AmbianceValue", ambianceSchema);

