// Since only a few people will have access to the app, there is no need to use a complex key-value store
const Crypto = require("crypto");


// proxy handler
const handler = {
    get(target, key) {
        let val = key in target ? target[key] : null;
        return val
    },
    set(target, key, value) {
        target[key] = value;
    }
};



const proxyObj = new Proxy({}, handler);


const sessionStore = {
    set(key, value) {
        if (!value || !key) {
            throw new Error("[key] and [value] parameters are required!")
        }
        proxyObj[key] = value;
    },
    get(key) {
        let val = proxyObj[key];
        if (!val) {
            val = Crypto.randomBytes(10).toString("hex"); // produce new Id if the key is not in the store
            sessionStore.set(key, val);
        }
        return val;
    },
    delete(key) {
        delete proxyObj[key];
    }
};


module.exports = sessionStore;

