const User = require("../../models/user");



module.exports = (bot) => {

    const sendMessageToAllUsers = async (msg) => {

        const users = await User.find().exec();

        for (let user of users) {
            await bot.telegram.sendMessage(user.chatId, msg);
        }

        return true;

    };









    return { sendMessageToAllUsers }



};