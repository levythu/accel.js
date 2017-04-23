var conf = require("../kernel/conf");
var net = require("net");
var JsonSocket = require("json-socket");

function SocketClient(processMessage) {
    var socket = new JsonSocket(new net.Socket());
    socket.connect(conf.masterListenPort, conf.tempMasterEndpoint);
    this.masterSocket = socket;
    socket.on("message", function(message) {
        processMessage(message);
    });
}

module.exports = SocketClient;
