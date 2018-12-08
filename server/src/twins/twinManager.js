const EventEmitter = require('events');


class UpdateEmitter extends EventEmitter {}
const updateEmitter=new UpdateEmitter();

let twinManager=null;


class TwinManager{

    constructor({model}){
        //Object.assign(this,{collectionName});
        this.model=model;
        this.twins=new Map();
        this._newDeviceUpdateEventName="newDeviceUpdate";

    }

    async _init(){
        //const Device=Mongoose.model(this.modelName);

        const devices=await this.model.find({}).exec();

        devices.forEach((d)=>{
            this._updateTwin(d.toObject());
        });

        this.model.watch().on("change",(doc)=>{
            this._updateTwin({...doc.fullDocument});
        });
    }

   _updateTwin(twin){
        // if twin is updated, update the data here
        this.twins.set(twin.shortName,twin);
        updateEmitter.emit(this._newDeviceUpdateEventName,{...twin});
    }
    registerUpdateEvent(cb){
        updateEmitter.on(this._newDeviceUpdateEventName,cb);
    }

}


const init=async(modelName)=>{

    if(!twinManager){
        twinManager=new TwinManager(modelName);
        await twinManager._init();
    }

    return twinManager;

};

const getManager=()=>{

    if(!twinManager){
        throw new Error("Twin manager was not initialized!")
    }
    return twinManager;
};

module.exports={
    init,
    getManager
};

