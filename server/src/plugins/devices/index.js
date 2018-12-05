const Joi = require('joi');
const RoutesV1=require("./routesV1");

//const Handlers = require("./deviceRouteHandlers");


//const handlers = Handlers();

const register = async function (server, options) {

    server.route(RoutesV1);

};



const plugin = {
    name: "devicesPlugin",
    register

}

module.exports = plugin;