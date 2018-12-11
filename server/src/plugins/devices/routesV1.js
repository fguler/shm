const Joi = require('joi');
const Handlers = require("./deviceRouteHandlers");

const handlers = Handlers();


const routes = [];

routes.push({
    method: "POST",
    path: "/api/v1/devices/ambiance",
    handler: handlers.saveAmbianceValues,
    options: {
        validate: {
            payload: {
                temp: Joi.number().required(),
                hum: Joi.number().required(),
                gas: Joi.number().required(),
                hpa: Joi.number().required(),
                deviceId: Joi.string().required()
            }
        },
        plugins:{
            "mqttMessageAuth":{prop:"deviceId"}
        }
    }
});


routes.push({
    method: "POST",
    path: "/api/v1/devices/register",
    handler: handlers.registerNewDevice,
    options: {
        validate: {
            payload: {
                deviceId: Joi.string().required(),
                definition: Joi.string().required(),
                shortName: Joi.string().required(),
                type:Joi.string()
            }
        }
    }
});

routes.push({
    method: "POST",
    path: "/api/v1/devices/gasAlert",
    handler: handlers.gasAlert,
    options: {
        validate: {
            payload: {
                status: Joi.bool().required(),
                deviceId: Joi.string().required()
            },
        },
        plugins:{
            "mqttMessageAuth":{prop:"deviceId"}
        }
    }
});

routes.push({
    method: "POST",
    path: "/api/v1/devices/leakAlert",
    handler: handlers.leakAlert,
    options: {
        validate: {
            payload: {
                status: Joi.bool().required(),
                deviceId: Joi.string().required()
            },
        },
        plugins:{
            "mqttMessageAuth":{prop:"deviceId"}
        }
    }
});



routes.push({
    method: "POST",
    path: "/api/v1/devices/checkIn",
    handler: handlers.deviceCheckIn,
    options: {
        validate: {
            payload: {
                deviceId: Joi.string().required(),
                localIp: Joi.string().required()
            }
        },
        plugins:{
            "mqttMessageAuth":{prop:"deviceId"}
        }
    }
});

routes.push({
    method: "POST",
    path: "/api/v1/devices/test",
    handler: async (request, h)=>{

        console.log(request.payload);

        return {status:"ok"};
    },
    options: {
        validate: {
            payload: {
                deviceId: Joi.string().required(),
                status: Joi.string(),
            }
        },
        plugins:{
            "mqttMessageAuth":{prop:"deviceId"}
        }
    }
});


/* routes.push({
    method: "POST",
    path: "/api/v1/devices/doorAlert",
    handler: handlers.doorAlert
}); */

/*     routes.push({
        method:"POST",
        path:"/api/devices/alarmTest",
        handler:handlers.alarmTest
    }); */

module.exports = routes;