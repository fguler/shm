const Boom = require('boom');
const Bot = require("../../bot/bot");
const Alarm = require("../../raspi/alarm/alarm");
const AmbValuesM = require("../../models/ambiance");
const Device = require("../../models/device");


module.exports = () => {

    // updates Ambiance values (e.g. temprature,humudity) sent from relevant device
    const saveAmbianceValues = async (request, h) => {

        try {
            let { temp, air, gas, hpa, hum } = request.payload
            const ambValues = new AmbValuesM({ temp, air, gas, hpa, hum });
            await ambValues.save();
        } catch (error) {
            console.log(error.stack)
            return Boom.badRequest(error.message)
        }

        const response = h.response({response:"created"}).code(201).type('application/json');
        // response.header('X-Custom-F', 'some-value');
        return response;

    };

    //register new IoT device
    const registerNewDevice = async (request, h) => {

        try {
            const device = new Device({ ...request.payload });
            await device.save();

        } catch (error) {
            console.log(error.stack)
            return Boom.badRequest(error.message)
        }

        return { response: "ok." };

    };


    // triggred when there is a leak alert at home
    const leakAlert = async (request, h) => {
        console.log("Leak alert was received!");
        let msg = "Leak alert has been trigered, check the house!";

        try {
            let alarmFire = await Alarm.shouldAlarmFire();

            if (alarmFire) {
                await Bot.sendMessageToAllUsers(msg);
                await Alarm.fire();
            }

        } catch (error) {
            console.log(error.stack)
            return Boom.badRequest(error.message)
        }

        return { response: "ok." };

    };


    const doorAlert = async (request, h) => {
        console.log("Door alert was received!");

        let msg = "Attention! Balcony door has been opened!";

        try {
            let alarmFire = await Alarm.shouldAlarmFire();

            if (alarmFire) {
                await Bot.sendMessageToAllUsers(msg);
                await Alarm.fire();
            }

        } catch (error) {
            console.log(error.stack)
            return Boom.badRequest(error.message)
        }

        return { response: "ok." };

    };



    const gasAlert = async (request, h) => {
        console.log("Gas alert was received!");
        let msg = "Attention! Air quality has dropped significantly, check the house!";

        try {
            let alarmFire = await Alarm.shouldAlarmFire();

            if (alarmFire) {

                await Bot.sendMessageToAllUsers(msg);
                await Alarm.fire();
            }

        } catch (error) {
            console.log(error.stack)
            return Boom.badRequest(error.message)
        }


        return { response: "ok." };

    };


    const alarmTest = async (request, h) => {

        try {
            let alarmFire = await Alarm.shouldAlarmFire();
            console.log("shouldAlarmFire", alarmFire);
        } catch (error) {
            console.log(error.stack)
            return Boom.badRequest(error.message)
        }
        return { response: "ok." };

    };

    const deviceCheckIn = async (request, h) => {

        try {
            const dev = await Device.findOne({ deviceId: request.payload.deviceId }).exec();

            if (dev) {
                dev.lastCheckIn = new Date();
                dev.localIp = request.payload.localIp;
                await dev.save();
            } else {
                throw new Error(`Device with id ${request.payload.deviceId} does not exist!`)
            }
        } catch (error) {
            console.log(error.stack);
            return Boom.badRequest(error.message)
        }

        return { response: "ok." };

    };


    return {
        saveAmbianceValues,
        leakAlert,
        doorAlert,
        gasAlert,
        registerNewDevice,
        deviceCheckIn,
        alarmTest
    };

};