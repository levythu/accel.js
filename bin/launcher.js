#!/usr/bin/env node

const path=require("path");
const accel=require("accel");

process.argv.shift();
process.argv.shift();
var targetJS=path.join(process.cwd(), process.argv[0]);
process.argv.unshift("nodejs");

accel.init({}, () => {
    require(targetJS);
});
