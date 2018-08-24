const Alarm=require("./alarm");
const Ambiance=require("./ambiance");
const Report=require("./report");
const Chart=require("./chart");
const Devices=require("./devices");


const actions=Object.assign({},
    Alarm(),
    Ambiance(),
    Report(),
    Chart(),
    Devices()
);

module.exports=actions;
