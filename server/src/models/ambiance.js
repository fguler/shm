const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const ambianceSchema = Schema({
    temp: { type: Number, default: 1 },
    hum: { type: Number, default: 1 },
    gas: { type: Number, default: 1 },
    hpa: { type: Number, default: 1 },
    createdAt: { type: Date, default: ()=>new Date() }
});


module.exports = Mongoose.model("AmbianceValue", ambianceSchema);

