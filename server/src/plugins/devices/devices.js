const Joi = require('joi');
const Handlers=require("./deviceRouteHandlers");

const handlers=Handlers();

const register=async function (server, options) {


    server.route({
        method: "POST",
        path: "/api/devices/ambiance",
        handler: handlers.saveAmbianceValues,
        options:{
            validate:{
                payload:{
                    temp:Joi.number().required(),
                    hum:Joi.number().required(),
                    gas:Joi.number().required(),
                    hpa:Joi.number().required()
                }
            }
        }
    });

    server.route({
        method:"POST",
        path:"/api/devices/gasAlarm",
        handler:handlers.gasAlert,
        options:{
            validate:{
                payload:{
                    gasAlarm:Joi.bool().required()
                }
            }
        }
    });



    server.route({
        method:"POST",
        path:"/api/devices/leakAlert",
        handler:handlers.leakAlert
    });

    server.route({
        method:"POST",
        path:"/api/devices/doorAlert",
        handler:handlers.doorAlert
    });

/*     server.route({
        method:"POST",
        path:"/api/devices/alarmTest",
        handler:handlers.alarmTest
    }); */
    
};



const plugin={
    name:"devicesPlugin",
    register

}

module.exports=plugin;