const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

const deviceSchema = Schema({
    deviceId: { type: String, require: true, trim: true },
    definition: { type: String, require: true, trim: true },
    comment: { type: String,default:"" },
    lastCheckIn: { type: Date, default: ()=>new Date()  }
});

module.exports=Mongoose.model("Device",deviceSchema);
