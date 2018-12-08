
const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const deviceSchema = Schema({
    deviceId: { type: String, require: true, trim: true },
    type: { type: String, default: "NA", trim: true },
    definition: { type: String, require: true, trim: true },
    shortName: { type: String, default: "NA", require: true },
    features: Schema.Types.Mixed,
    lastCheckIn: { type: Date, default: () => new Date() },
    localIp: { type: String, default: "" }
});

module.exports = Mongoose.model("Device", deviceSchema);




/* const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const deviceSchema = Schema({
    deviceId: { type: String, require: true, trim: true },
    definition: { type: String, require: true, trim: true },
    comment: { type: String, default: "" },
    status: { type: String, default: "" },
    lastCheckIn: { type: Date, default: () => new Date() },
    localIp: { type: String, default: "" }
});

module.exports = Mongoose.model("Device", deviceSchema);
 */