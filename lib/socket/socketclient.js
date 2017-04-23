var conf = require("../kernel/conf");
var net = require("net");
var JsonSocket = require("json-socket");

function SocketClient(processMessage) {
    // listen
    this.server = net.createServer();
    this.server.listen(0);
    // console.log(this.server.address().port);
    this.server.on("connection", function(socket) {
        socket = new JsonSocket(socket);
    });

    // connect to server
    var socket = new JsonSocket(new net.Socket());
    socket.connect(conf.listenPort, conf.tempMasterEndpoint);
    this.masterSocket = socket;
    socket.on("message", function(message) {
        processMessage(message);
    });
}

SocketClient.prototype.connectOtherWorkers = function(ports) {
    this.clientSockets = [];
    for (var i in ports) {
        if (i !== conf.workerInfo.id.toString()) {
            var socket = new JsonSocket(new net.Socket());
            socket.connect(ports[i].port, conf.localWorkerEndpoint);
            this.clientSockets.push({
                id: ports[i].id,
                socket: socket,
            })
        }
    }
}

SocketClient.prototype.sendToMaster = function(msg) {
    this.masterSocket.sendMessage(msg)
}
module.exports = SocketClient;
