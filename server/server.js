require('dotenv').config();
const Path = require("path");
const Hapi = require("hapi");
const Bot = require("./src/bot/bot");
const BackTasks = require("./src/utils/backgroundTasks")();
const Mongoose = require('mongoose');

process.env.GOOGLE_APPLICATION_CREDENTIALS = Path.join(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);


const server = Hapi.server({
    host: '0.0.0.0',
    port: 7788
});


//list of plugins
const plugins = [

    {
        plugin: require("./src/plugins/devices/devices"),
        options: {}
    },
    {
        plugin: require("./src/plugins/mqtt/msgInjector"),
        options: {}
    }
];


const start = async () => {

    await server.register(plugins);


    server.route({
        method: "GET",
        path: "/",
        handler: function (request, h) {

            return "index";

        }
    });


    // start server
    await server.start();

    //connect to mongoDB
    Mongoose.Promise = global.Promise; // Use native promises

    const mongoOptions = {
        reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
        reconnectInterval: 2000, // Reconnect every 2000ms
    };
    await Mongoose.connect(process.env.MONGODB_MLAP_URL, mongoOptions);
    console.log("MongoDB Connected...")

    // start telegram bot
    Bot.start();


    // start repetitive tasks
    BackTasks.run();

    return server;
}


start().then((server) => {
    console.log('Server running at:', server.info.uri);
}).catch((err) => {
    console.log(err);
    process.exit(1);
});



const gracefulShutdown = async (signal, code) => {

    try {
        await server.stop();
        await Mongoose.disconnect();
        process.exit(code)
    } catch (error) {
        console.log(error);
        process.exit(1);
    }

};

process.on('SIGINT', gracefulShutdown);
