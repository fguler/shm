//const DB=require("../../dbApi/db");
const Ambiance = require("../../models/ambiance");
const Utils = require("../../utils/utils");





module.exports = () => {

    const getLastAmbianceRecord = async () => {

        let msg = "";

        // get the last record
        const docs = await Ambiance.find().
            sort({ _id: -1 }).
            limit(1).exec();

        if (docs) {
            let { temp, hum, gas, hpa, createdAt } = docs[0];
            createdAt = Utils.dateFromString(createdAt);

            msg = `Temperature: ${temp}°C, Humidity : ${hum}%,\nAir Pressure : ${hpa} hpa, Air Quality : ${gas} \n(${createdAt})`;

        } else {
            msg = "There is no record in the database!"
        }


        return msg;

    };



    return {
        getAmbianceActions() {
            return {
                getLastAmbianceRecord
            };

        }
    }
};
