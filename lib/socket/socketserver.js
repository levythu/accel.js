var conf = require("../kernel/conf");
var msg = require("../communication/marshall");
var net = require("net");
var JsonSocket = require("json-socket");

function SocketServer(onmessage, callback, callback2) {
    this.onmessage = onmessage;
    this.sockets = [];
    var that = this;
    var nextId = 0;
    this.server = net.createServer();
    this.server.listen(conf.listenPort);
    this.server.on("connection", function(socket) {
        socket = new JsonSocket(socket);
        that.sockets.push({
            socket: socket,
            id: nextId,
        });

        socket.on("message", function(message) {
            var id = that.sockets.find(x => x.socket === socket).id;
            var obj = msg.unmarshall(message);
            if (obj.type === "ready") {
                that.sockets[id].port = obj.port;
                that.sockets[id].endpoint = obj.endpoint;
                if (callback) {
                    callback();
                }
                return;
            } else if (obj.type === "fully connected") {
                if (callback2) {
                    callback2();
                }
            }
            if (that.onmessage != null) {
                // console.log(message);
                setImmediate(function() {
                    that.onmessage({
                        id: id,
                        msg: message,
                    });
                });
            }
        });
        socket.sendMessage(msg.marshall({
            type: "init",
            nodeId: nextId++,
            nodeType: "local",
        }));
    });
}

SocketServer.prototype.broadcastPorts = function() {
    var ports = [];
    for (var i in this.sockets) {
        ports.push({
            id: this.sockets[i].id,
            port: this.sockets[i].port,
            endpoint:this.sockets[i].endpoint,
        })
    }
    var message = msg.marshall({
        type: "ports",
        ports: ports,
    });
    // broadcast
    for (var i in this.sockets) {
        this.sockets[i].socket.sendMessage(message);
    }
}

module.exports = SocketServer;
