#!/usr/bin/env node

var packageName="accel";
if (process.env.ACCELJS_PATH!=null) {
    packageName=process.env.ACCELJS_PATH;
}

const path=require("path");
const accel=require(packageName);
const fs=require("fs");

var confed=false;
var conf={};

function parseArg() {
    function parseLocalEnv() {
        var flag=process.argv.shift();
        var envCount=process.argv.shift();
        envCount=parseInt(envCount);
        if (isNaN(envCount)) {
            console.error("<WorkersCount> must be an integer.");
            console.error("Try accel --help for more information");
            process.exit(-1);
        }
        if (!("env" in conf)) conf.env=[];
        conf.env.push({local: envCount});
        confed=true;
    }
    function parseRemoteEnv() {
        var flag=process.argv.shift();
        var endpoint=process.argv.shift();
        var port=process.argv.shift();
        port=parseInt(port);
        var envCount=process.argv.shift();
        envCount=parseInt(envCount);
        if (isNaN(envCount)) {
            console.error("<WorkersCount> must be an integer.");
            console.error("Try accel --help for more information");
            process.exit(-1);
        }
        if (!("env" in conf)) conf.env=[];
        conf.env.push({remote: envCount, port:port, endpoint: endpoint});
        console.log(conf.env);
        confed=true;
    }
    function displayHelp() {
        console.log("Usage: acceljs [OPTION]... ENTRYJS [PARAMETER-TO-ENTRYJS]... ");
        console.log("Initiate accel environment, and then launch javascript specified by ENTRYJS");
        console.log("\nOPTION specify the initial options, overriding options from configuration file");
        console.log("If no OPTION is provided, read options from JSON file accel-config.json");
        console.log("");
        console.log("  -l, --env-local NUM\t", "Launch local workers with number NUM");
        console.log("  -r, --remote-local ENDPOINT PORT NUM\t", "Launch remote workers at ENDPOINT in PORT with number NUM");
        console.log("  -h, --help\t", "Display help and exit");
        console.log("");
        process.exit(0);
    }
    var parameter={
        "--env-local": parseLocalEnv,
        "-l": parseLocalEnv,
        "--env-remote": parseRemoteEnv,
        "-r": parseRemoteEnv,
        "--help": displayHelp,
        "-h": displayHelp,
    };
    // argv=["nodejs", "launcher.js", ("--env-local", "4", "--env-remote", "<someendpoint>", "1", ...), "targetJs", "paramsToTarget"]
    process.argv.shift();
    process.argv.shift();
    while (process.argv.length>0 && process.argv[0] in parameter) {
        parameter[process.argv[0]]();
    }
}

parseArg();
var targetJS=path.join(process.cwd(), process.argv[0]);
if (!confed) {
    try {
        rs=fs.readFileSync("accel-config.json", {encoding: 'utf8'});
        conf=JSON.parse(rs);
    } catch (e) {
    }
}

process.argv.unshift("nodejs");
accel.init(conf, () => {
    try {
        require(targetJS);
    } catch (e) {
        console.error(e);
        process.exit(-1);
    }
});
