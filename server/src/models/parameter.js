const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const paramSchema = Schema({
    areUsersAtHome: { type: Boolean, default: false },
    isAlarmActivated: { type: Boolean, default: true },
    nightModeTimeRange: {
        start: { type: Number, default: 1 },
        end: { type: Number, default: 6 }
    }

});

module.exports = Mongoose.model("Parameter", paramSchema);
