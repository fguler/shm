const CUP=require("./checkUsersPresence");



module.exports=()=>{

    const run=()=>{
        CUP.start()
    };



    return {
        run
    }

};
