
const { spawn } = require("child_process");
const { sleep, promisedExec } = require("../../utils/utils");
const Path = require("path");
const sAlarmfire = require("./shouldAlarmFire");






const alarm = () => {

    const state = {
        active: false
    };




    const fire = async () => {


        // if alarm has already been acticated do nothing
        if (state.active) {
            return;
        }

        state.active = true;

        await promisedExec("echo on 0 | cec-client -s -d 1");
        await sleep(1000);
        await promisedExec("echo on 0 | cec-client -s -d 1");

        await sleep(10000);

        let path = Path.join(process.env.HOME, "Music", "alarm.mp3");


        let child = spawn(`omxplayer -o hdmi ${path}`, {
            shell: true
        });

        child.on("exit", (code, signal) => {
            state.active = false;
            child = null;
        });

        return true;

    };




    return {
        fire
    };

};


module.exports = Object.assign({}, alarm(), sAlarmfire());




/* class Alarm{

    constructor(){
        this.active=false;
    }



    async fire(){


        // if alarm has already been acticated do nothing
        if(this.active){
            return;
        }

        this.active=true;

        await promisedExec("echo on 0 | cec-client -s -d 1");

        sleep(18000);

        let path=Path.join(process.env.HOME,"Music","alarm.mp3");


        let child = spawn(`omxplayer -o hdmi ${path}`, {
            shell: true
          });

        child.on("exit",(code,signal)=>{
            this.active=false;
            console.log(this.active);
            child=null;
        });

        return true;

    }


} */