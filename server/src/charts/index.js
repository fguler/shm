const Path=require("path");
const TempAndHum=require("./tempAndHum");


const htmlFilePath=`file:${Path.join(process.cwd(),"src","charts","assets","chart.html")}`;

const tmpPath=Path.join(process.cwd(),"tmp/");

const charts=Object.assign({},TempAndHum({htmlFilePath,tmpPath}));


module.exports=charts;