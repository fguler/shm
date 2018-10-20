const Puppeteer = require('puppeteer');
const Utils = require("../utils/utils");


const createChart = async ({config,htmlFilePath,outputPath}) => {

    let browser="";
    const environment = process.env.NODE_ENV;

    if(environment=="development"){
        browser = await Puppeteer.launch({ headless: true });
    }else{
        // executablePath is necessary on raspberry pi
        browser = await Puppeteer.launch({ executablePath: '/usr/bin/chromium-browser' });
    }

    const page = await browser.newPage();

    await page.goto(htmlFilePath);

    // pass chart config to the page
    await page.evaluate((args) => {
        drawChart(args);
    }, { config });

    await Utils.sleep(1000);
    await page.screenshot({ path: outputPath });
    await browser.close();

    return outputPath;

};

module.exports={
    createChart
}