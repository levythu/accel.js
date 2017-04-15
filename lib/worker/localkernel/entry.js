var msg=require("../../communication/marshall");
var conf=require("../../kernel/conf");
var executor=require("./eval");

conf.isMaster=false;

process.on('message', function(str) {
    console.log(str);
    var obj;
    obj=msg.unmarshall(str);

    if (obj.type==="init") {
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
