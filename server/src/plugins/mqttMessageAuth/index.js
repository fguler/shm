const Boom = require('boom');
const Device = require("../../models/device");

const internals = {};
const pluginName = 'mqttMessageAuth';


// check if routes which require authorization have been configured correctly
internals.validateRoutes = (server) => {

    const routes = server.table();

    // loop through routes
    routes.forEach((route) => {

        const authorizationParams = route.settings.plugins[pluginName] ? route.settings.plugins[pluginName] : false;

        if (authorizationParams !== false) {
            let prop = authorizationParams.prop;

            if (!prop) {
                throw Boom.badImplementation(`One of the routes is misconfigured for authorization!`);
            }
        }
    });

};


internals.onPreHandler = async (request, h) => {

    try {
        // get the parameters set for this plugin in the route
        const authorizationParams = request.route.settings.plugins[pluginName] ? request.route.settings.plugins[pluginName] : false;

        if (!authorizationParams) {
            return h.continue; // this route does not enforce authorization, so return
        }
    
        let propName = authorizationParams.prop; // Property name to authorize this request
        let payload=request.payload;

        if (!payload[propName]) { // check if payload contains the property required
            throw new Error(`The payload does not have the ${propName} property!`);
        }

        const dev = await Device.findOne({ [propName]: payload[propName] }).exec();

        if (!dev) {
            throw new Error(`The given ${propName} (${payload[propName]}) is unknown!`);
        }

        return h.continue;
        
    } catch (error) {
        console.log(error);
        return h.close
    }

};


// this plugin checks whether sender mqtt client (device) is allowed to send messages to this server
const register = async function (server, options) {

    server.ext('onPreStart', internals.validateRoutes);
    server.ext('onPreHandler', internals.onPreHandler);

};


const plugin = {
    name: pluginName,
    register
};

module.exports = plugin;