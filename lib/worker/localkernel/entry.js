var conf=require("../../kernel/conf");
conf.isMaster=false;

var msg=require("../../communication/marshall");
var executor=require("./eval");
var accel=require("../../index");

process.on('message', function(str) {
    console.log(str);
    var obj;
    obj=msg.unmarshall(str);

    if (obj.type==="init") {
        conf.workerInfo={
            type: obj.nodeType,
            id: obj.nodeId,
        };
        accel.id=obj.nodeId;
        accel.type=obj.nodeType
        process.send(msg.marshall({
            type: "ready",
        }));
        process.send(msg.marshall({
            type: "pull",
            maxtask: 3,
        }));
    } else if (obj.type==="push") {
        if ("addons" in obj) {
            for (var i=0; i<obj.addons.length; i++) {
                executor.syncEnv(obj.addons[i].envId, obj.addons[i].patch);
            }
        }
        // TODO support multi task!
        executor.executeTask(obj.task[0], function(result) {
            process.send(msg.marshall({
                type: "report",
                maxtask: 3,
                tag: obj.task[0].tag,
                result: result
            }));
        });
    } else {
        // TODO report the error?
    }
});
