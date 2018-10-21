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
                air: Joi.number().required(),
                hpa: Joi.number().required(),
                deviceId: Joi.string().required()
            }
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
                comment: Joi.string()
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
            }
        }
    }
});

routes.push({
    method: "POST",
    path: "/api/v1/devices/leakAlert",
    handler: handlers.leakAlert
});

routes.push({
    method: "POST",
    path: "/api/v1/devices/doorAlert",
    handler: handlers.doorAlert
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
        }
    }
});

/*     routes.push({
        method:"POST",
        path:"/api/devices/alarmTest",
        handler:handlers.alarmTest
    }); */

module.exports = routes;