var conf = require("../kernel/conf");
var msg = require("../communication/marshall");
var JsonSocket = require("json-socket");
var net = require("net");
var ip = require("ip");

function RemoteWorker(id, endpoint, port) {
    this.connected = false;
    this.id = id;
    this.port = port;
    this.endpoint = endpoint;
    return this;
}
RemoteWorker.prototype.send = function(str, callback) {
    this.socket.sendMessage(str);
    if (callback)
        callback();
}
RemoteWorker.prototype.launch = function(callback) {
    JsonSocket.sendSingleMessage(this.port, this.endpoint, msg.marshall({
        type: "init",
        nodeType: "remote",
        nodeId: this.id,
        masterEndPoint: ip.address(),
        masterPort: conf.listenPort,
    }));
}

RemoteWorker.prototype.terminate = function(callback) {
    this.send(msg.marshall({
        type: "terminate",
        id:"123",
    }));
    if (callback)
        setImmediate(function() {
            callback(null);
        });
}

module.exports = RemoteWorker;
