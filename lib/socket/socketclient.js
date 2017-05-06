var msg = require("../communication/marshall");
var conf = require("../kernel/conf");
var entry  = require("../worker/localkernel/entry")
var net = require("net");
var JsonSocket = require("json-socket");

function SocketClient(processMessage) {
    // listen
    this.clientSockets = [];
    var that = this;
    this.server = net.createServer();
    this.server.listen(0);
    this.server.on("connection", function(socket) {
        socket = new JsonSocket(socket);
        socket.on("message", function(message) {
            var obj = msg.unmarshall(message);
            if (obj.type === "worker") {
                that.addToSocketsList({
                    id: obj.id,
                    socket: socket,
                });
            } else if (obj.type === "test") {
                console.log(obj);
            } else {
                throw new Error("worker received invalid type message!");
            }
        });
    });

    // connect to server
    var socket = new JsonSocket(new net.Socket());
    socket.connect(conf.listenPort, conf.tempMasterEndpoint);
    this.masterSocket = socket;
    socket.on("message", function(message) {
        try {
            processMessage(message);
        } catch (e) {
            console.error(e);
        }
    });
}

SocketClient.prototype.connectOtherWorkers = function(ports, callback) {
    this.totalNumber = ports.length - 1; // except itself
    if (this.totalNumber === 0) {
        this.sendFullyConnectedMessage();
    }
    for (var i in ports) {
        if (conf.workerInfo.id < parseInt(i)) {
            var socket = new JsonSocket(new net.Socket());
            socket.connect(ports[i].port, conf.localWorkerEndpoint);
            socket.sendMessage(msg.marshall({
                type: "worker",
                id: conf.workerInfo.id,
            }));
            socket.on("message", function(message) {
                var obj = msg.unmarshall(message);
                if (obj.type === "test") {
                    console.log(obj);
                }
            });
            this.addToSocketsList({
                id: ports[i].id,
                socket: socket,
            })
            // TODO not ready for use yet
        }
    }
}

SocketClient.prototype.sendToMaster = function(msg) {
    this.masterSocket.sendMessage(msg)
}

SocketClient.prototype.addToSocketsList = function(obj) {
    this.clientSockets.push(obj);
    if (this.clientSockets.length === this.totalNumber) {
        this.sendFullyConnectedMessage();
    }
}

SocketClient.prototype.sendFullyConnectedMessage = function() {
    this.masterSocket.sendMessage(msg.marshall({
        type: "fully connected"
    }));
    entry.onFinishInit();
}

SocketClient.prototype.sendMessage = function(id, msg) {
    var soc = this.clientSockets.find(x => x.id === id);
    if (soc) {
        soc.socket.sendMessage(msg);
    }
}

module.exports = SocketClient;
