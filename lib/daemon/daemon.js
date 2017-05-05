var conf = require("../kernel/conf");
var msg = require("../communication/marshall");
var net = require("net");
var JsonSocket = require("json-socket");
var childprocess=require("child_process");
var path = require('path');

function Daemon() {
    server = net.createServer();
    server.listen(conf.daemonPort);
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
    proc = childprocess.fork(path.join(__dirname, "../worker/localkernel/entry"), [], [0, 1, 2, "ipc"]);
}

Daemon();
