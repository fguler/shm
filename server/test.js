const moment=require("moment");

console.log(moment())

console.log(moment().date());


console.log("4 weeks ago week 1",moment().isoWeek((moment().isoWeek()-4)));
console.log("4 weeks ago week 2",moment().subtract(4, 'weeks').toISOString());
console.log("last month",moment().subtract(1, 'months').toISOString());

console.log("last month 2",new Date(moment().subtract(1, 'months')).toISOString());
console.log("12 hours ago",moment().subtract(12, 'hours'));

console.log(moment("2018-07-01T18:09:23.772Z").toString());