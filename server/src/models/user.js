const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const userSchema = Schema({
    chatId: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    deviceIPs: [String],
    roles: [String]

});

module.exports = Mongoose.model("User", userSchema);

