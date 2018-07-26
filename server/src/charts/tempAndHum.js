const ChartConfig = require("./chartConfigs/tempAndHum_c");
const puppeteer = require('puppeteer');
const Utils=require("../utils/utils");
const AmbianceModel=require("../models/ambiance");

const timeRangeOptions={
    HOURLY:"hourly", // last 12 hours
    WEEKLY:"weekly", // last 4 week
    MONTHLY:"monthly" // last 6 month
};

const labelsAndDataFromMap=(map)=>{
    const labelsAndData={
        labels:[],
        data:[]
    };
    // this is necessary because we might have two values corresponding to one label
    map.forEach((valArray,label)=>{
        labelsAndData.labels.push(label);

        let sum=valArray.reduce((sum,val)=>sum+val,0); // sum up all values inside the array

        labelsAndData.data.push(parseInt(sum/valArray.length));
    });


    return labelsAndData;
};


const prepareChartData=(timeRange,records)=>{

    const labelsAndData={
        labelDefinition:"NaN",
        temp:{
            labels:[],
            data:[]
        },
        hum:{
            labels:[],
            data:[]
        }
    };

    const mapTemp=new Map();
    const mapHum=new Map();

    if(timeRange==timeRangeOptions.HOURLY){
        labelsAndData.labelDefinition="Hours";
    }

    // loop docs coming from mongoDB
    records.forEach(doc => {
        let {temp, hum, createdAt } = doc;
        let label;

        // decide label category
        if(timeRange==timeRangeOptions.HOURLY){
            label=new Date(createdAt).getHours("tr-TR",{hour12:false}); // label is hour
        }

        // add values to maps
        if(mapTemp.has(label)){
            // temp values
            let valTemp=mapTemp.get(label);
            valTemp.push(parseInt(temp));
            mapTemp.set(label,valTemp);

            // hum values
            let valHum=mapHum.get(label);
            valHum.push(parseInt(hum));
            mapHum.set(label,valHum);

        }else{
            mapTemp.set(label,[parseInt(temp)]); // add temp value to Map
            mapHum.set(label,[parseInt(hum)]); // add humudity value to Map
        }

       
    });

    //turn maps into label and data arrays form compatible with by Chart.js
    let {labels,data}=labelsAndDataFromMap(mapTemp);
    labelsAndData.temp.labels=[...labels];
    labelsAndData.temp.data=[...data];

    ({labels,data}=labelsAndDataFromMap(mapHum));
    labelsAndData.hum.labels=[...labels];
    labelsAndData.hum.data=[...data];


    return labelsAndData;

};

// fetch docs from mongoDB
const getRecordsfromDB=async(timeRange)=>{
    let date,records;

    if(!timeRange){
        throw Error("[timeRange] argument is required in [getRecordsfromDB] function");
    }

    if(timeRange==timeRangeOptions.HOURLY){
        let twelveHours=((60000*60)*12); //twelve hours in milliseconds
        date=(Date.now()-twelveHours); // go back twelve 12 hours in time
    }

    records= await AmbianceModel.find().sort({_id:1})
    .where("createdAt").gte(new Date(date)).exec(); // get latest records
    
    return records;

};


module.exports = ({ htmlFilePath,tmpPath }) => {


    // Temperature and Humudity result of last 12 hours
    const hourlyTempAndHum = async () => {

        let records=await getRecordsfromDB(timeRangeOptions.HOURLY);
        const chartData=prepareChartData(timeRangeOptions.HOURLY,records);

        //const browser = await puppeteer.launch({ headless: true });

        // executablePath is necessary on raspberry pi
        const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser'});
        const page = await browser.newPage();

        await page.goto(htmlFilePath);

        let config = ChartConfig(chartData);

        // pass chart config to the page
        await page.evaluate((args) => {
            drawChart(args);
        }, { config });

        await Utils.sleep(1000);
        const outputPath=tmpPath+'tempAndHum.png';

        await page.screenshot({ path: outputPath });

        await browser.close();

        return outputPath;


    };


    return {
        hourlyTempAndHum

    }
}