var conf = require("../kernel/conf");
var msg = require("../communication/marshall");
var net = require("net");
var JsonSocket = require("json-socket");

function SocketServer(onmessage, callback) {
    this.onmessage = onmessage;
    this.sockets = [];
    var that = this;

    this.server = net.createServer();
    this.server.listen(conf.masterListenPort);
    this.server.on("connection", function(socket) {
        console.log("new connection from " + socket.remoteAddress);
        socket = new JsonSocket(socket);
        that.sockets.push(socket);

        // TODO handle error
        // socket.once("message", function(message) {
        //     if ((msg.unmarshall(message).type === "ready")) {
        //         if (callback)
        //             callback();
        //     }
        // });
        socket.on("message", function(message) {
            if ((msg.unmarshall(message).type === "ready")) {
                if (callback) {
                    console.log("receive ready");
                    callback();
                }
                return;
            }
            if (that.onmessage != null) {
                var id = that.sockets.indexOf(socket);
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
            nodeId: that.sockets.length - 1,
            nodeType: "local",
        }));
    });

}

module.exports = SocketServer;
