const TwinManager = require("./twinManager");
const EnvSensor=require("./twins/envSensor");

const twinManager = TwinManager.init();


//Add all twins
const envSensor=EnvSensor.create("envSensor");


twinManager.addTwin(envSensor);



module.exports = {

    getManager() {
        return twinManager;
    }

};


/* this.model.watch().on("change",(doc)=>{
    this._updateTwin({...doc.fullDocument});
}); */