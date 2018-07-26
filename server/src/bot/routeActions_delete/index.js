const Alarm = require("./alarm");
const Ambiance = require("./ambiance");
const Report = require("./report");
const Chart=require("./chart");


const actions = Object.assign({},
    Alarm(),
    Ambiance(),
    Report(),
    Chart()
);


module.exports = actions;