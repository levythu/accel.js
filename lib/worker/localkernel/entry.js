var conf = require("../../kernel/conf");
conf.isMaster = false;

var msg = require("../../communication/marshall");
var executor = require("./eval");
var accel = require("../../index");
var CMsgRouter = require("../../kernel/cmsgrouter");
var SocketClient = require("../../socket/socketclient")
var ip = require("ip");

var time = 0;

var socketClient = new SocketClient(process.argv[2], process.argv[3], function(str) {
    if (conf.verbose)
        console.log(str);
    var obj;
    obj = msg.unmarshall(str);

    if (obj.type === "init") {
        conf.workerInfo = {
            type: obj.nodeType,
            id: obj.nodeId,
        };
        accel.id = obj.nodeId;
        accel.type = obj.nodeType;
        socketClient.sendToMaster(msg.marshall({
            type: "ready",
            port: socketClient.server.address().port,
            endpoint: ip.address(),
        }));

    } else if (obj.type === "ports") {
        // connects to all other workers
        socketClient.connectOtherWorkers(obj.ports);
    } else if (obj.type === "push") {
        if ("addons" in obj) {
            for (var i = 0; i < obj.addons.length; i++) {
                executor.syncEnv(obj.addons[i].envId, obj.addons[i].patch);
            }
        }
        // TODO support multi task!
        var now=(new Date()).getTime();
        executor.executeTask(obj.task[0], function(result) {
            time += (new Date()).getTime() - now;
            socketClient.sendToMaster(msg.marshall({
                type: "report",
                maxtask: 3,
                tag: obj.task[0].tag,
                result: result,
                time:time,
            }));
        });
    } else if (obj.type === "cmsg") {
        accel._msgRouter.OnMessage(obj);
    } else if (obj.type === "terminate") {
        console.log("worker " + conf.workerInfo.id + " exit!");
        process.exit();
    } else {
        // TODO report the error?
    }
});

function onFinishInit() {
    // TODO modify it later!
    accel._msgRouter = new CMsgRouter({
        "-1": {
            send: function(str) {
                socketClient.sendToMaster(str);
            }
        }
    });
    socketClient.sendToMaster(msg.marshall({
        type: "pull",
        maxtask: 1,
    }));
}
exports.onFinishInit = onFinishInit;
