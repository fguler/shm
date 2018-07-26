const User=require("../models/user");


// Middeware used to authenticate users
const auth=async (ctx, next)=>{

    let msg="Sorry my friend, I'm not allowed to talk to strangers. "+
    "So, your messages are going to be ignored!😢"

    let user=await User.findOne().where("chatId").equals(parseInt(ctx.from.id)).exec();

    if(!user){
        return ctx.reply(msg);
        //return ctx.leaveChat(ctx.from.id);
    }

    await next();

};


module.exports={auth};