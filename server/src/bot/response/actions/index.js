const Alarm=require("./alarm");
const Ambiance=require("./ambiance");
const Report=require("./report");
const Chart=require("./chart");
const Devices=require("./devices");
const Parameters=require("./parameters");


const actions=Object.assign({},
    Alarm(),
    Ambiance(),
    Report(),
    Chart(),
    Devices(),
    Parameters()
);

module.exports=actions;
