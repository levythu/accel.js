#!/usr/bin/env node

const path=require("path");
const accel=require("accel");
const fs=require("fs");

process.argv.shift();
process.argv.shift();
var targetJS=path.join(process.cwd(), process.argv[0]);
process.argv.unshift("nodejs");

var conf={};
try {
    rs=fs.readFileSync("accel-config.json", {encoding: 'utf8'});
    conf=JSON.parse(rs);
} catch (e) {
}

accel.init(conf, () => {
    require(targetJS);
});
