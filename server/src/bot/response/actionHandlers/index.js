const Alarm = require("./alarm");
const Ambiance = require("./ambiance");
const Report = require("./report");

const actions = Object.assign({},
    Alarm(),
    Ambiance(),
    Report()
);


module.exports = actions;