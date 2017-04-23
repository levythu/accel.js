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
        socket = new JsonSocket(socket);
        that.sockets.push(socket);

        // TODO why once is not a function?
        // socket.once("message", function(message) {
        //     if ((msg.unmarshall(message).type === "ready")) {
        //         if (callback)
        //             callback();
        //     }
        // });
        socket.on("message", function(message) {
            if ((msg.unmarshall(message).type === "ready")) {
                if (callback) {
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
