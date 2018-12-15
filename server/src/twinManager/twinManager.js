const EventEmitter = require('events');


//class UpdateEmitter extends EventEmitter {}
//const updateEmitter=new UpdateEmitter();


class TwinManager{

    constructor(){
        //Object.assign(this,{collectionName});
        this._twins=new Map();

    }

    addTwin(twin){
        this._twins.set(twin.getName(),twin);
    }

    updateFeaturesOfTwin(name,features){

        if(this._twins.has(name)){
            const twn=this._twins.get(name);
            twn.setFeatures(features);
        }else{
            throw new Error("The twin requested does not exist!");
        }
    }

    getTwinByName(name){

        if(this._twins.has(name)){
            return this._twins.get(name);
        }else{
            throw new Error("The twin requested does not exist!");
        }
    }

}


module.exports={
    init(){
        return new TwinManager();
    }
};




