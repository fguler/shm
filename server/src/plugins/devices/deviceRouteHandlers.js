const Boom = require('boom');
const Bot = require("../../bot/bot");
const Alarm = require("../../raspi/alarm/alarm");
const AmbValuesM = require("../../models/ambiance");
const Device = require("../../models/device");


module.exports = () => {

    // updates Ambiance values (e.g. temprature,humudity) sent from relevant device
    const saveAmbianceValues = async (request, h) => {

        try {
            let { temp, air, hpa, hum } = request.payload
            const ambValues = new AmbValuesM({ temp, air, hpa, hum });
            await ambValues.save();
        } catch (error) {
            console.error(error.stack)
            return Boom.badRequest(error.message)
        }

        return { response: "ok." };

    };

    //register new IoT device
    const registerNewDevice = async (request, h) => {

        try {
            const device = new Device({ ...request.payload });
            await device.save();

        } catch (error) {
            console.error(error.stack)
            return Boom.badRequest(error.message)
        }

        return { response: "ok." };

    };


    // triggred when there is a leak alert at home
    const leakAlert = async (request, h) => {
        let msg = "Leak alert has been trigered, check the house!";

        try {
            let alarmFire = await Alarm.shouldAlarmFire();

            if (alarmFire) {
                await Bot.sendMessageToAllUsers(msg);
                await Alarm.fire();
            }

        } catch (error) {
            console.error(error.stack)
            return Boom.badRequest(error.message)
        }

        return { response: "ok." };

    };


    const doorAlert = async (request, h) => {

        let msg = "Attention! Balcony door has been opened!";

        try {
            let alarmFire = await Alarm.shouldAlarmFire();

            if (alarmFire) {
                await Bot.sendMessageToAllUsers(msg);
                await Alarm.fire();
            }

        } catch (error) {
            console.error(error.stack)
            return Boom.badRequest(error.message)
        }

        return { response: "ok." };

    };



    const gasAlert = async (request, h) => {
        let msg = "Attention! Air quality has dropped significantly, check the house!";

        try {
            let alarmFire = await Alarm.shouldAlarmFire();

            if (alarmFire) {

                await Bot.sendMessageToAllUsers(msg);
                await Alarm.fire();
            }

        } catch (error) {
            console.error(error.stack)
            return Boom.badRequest(error.message)
        }


        return { response: "ok." };

    };


    const alarmTest = async (request, h) => {

        try {
            let alarmFire = await Alarm.shouldAlarmFire();
            console.log("shouldAlarmFire", alarmFire);
        } catch (error) {
            console.error(error.stack)
            return Boom.badRequest(error.message)
        }
        return { response: "ok." };

    };

    const deviceCheckIn = async (request, h) => {

        try {
            const dev = await Device.findOne({ deviceId: request.payload.id }).exec();

            if (dev) {
                dev.lastCheckIn = new Date()
                await dev.save();
            } else {
                throw new Error(`Device with id ${request.payload.id} does not exist!`)
            }
        } catch (error) {
            console.error(error.stack);
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