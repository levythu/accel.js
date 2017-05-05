var conf = require("../kernel/conf");
var msg = require("../communication/marshall");
var JsonSocket = require("json-socket");
var net = require("net");

function RemoteWorker(id, endpoint) {
    this.connected = false;
    this.id = id;
    this.endpoint = endpoint;
    return this;
}
RemoteWorker.prototype.send = function(str, callback) {
    this.socket.sendMessage(str);
    if (callback)
        callback();
}
RemoteWorker.prototype.launch = function(callback) {
    JsonSocket.sendSingleMessage(conf.daemonPort, this.endpoint, msg.marshall({
        type: "init",
        nodeType: "remote",
        nodeId: this.id,
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
