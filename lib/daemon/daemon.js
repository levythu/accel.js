#!/usr/bin/env node
var conf = require("../kernel/conf");
var msg = require("../communication/marshall");
var net = require("net");
var JsonSocket = require("json-socket");
var childprocess = require("child_process");
var path = require('path');

function Daemon(port) {
    server = net.createServer();
    server.listen(port);
    server.on("connection", function(socket) {
        socket = new JsonSocket(socket);
        socket.on("message", function(message) {
            var obj = msg.unmarshall(message);
            if (obj.type === "init") {
                if (obj.nodeType !== "remote") {
                    throw new Error("error node type");
                } else {
                    createNewWorker(obj.nodeId);
                }
            }
        });
    });
}

function createNewWorker(id) {
    console.log("new worker: " + id);
    proc = childprocess.fork(path.join(__dirname, "../worker/localkernel/entry"), [], [0, 1, 2, "ipc"]);
}

function parsePort() {
    if (process.argv.length !== 3) {
        displayHelp();
    }
    var port = parseInt(process.argv[2]);
    if (isNaN(port)) {
        console.error("<Port> must be an integer");
        process.exit(-1);
    }
    return port;
}

function displayHelp() {
    console.log("Usage: daemon [port]");
    process.exit(0);
}

Daemon(parsePort());
