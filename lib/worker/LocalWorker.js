// LocalWorker is implemented by
var childprocess=require("child_process");
var msg=require("../communication/marshall");

function LocalWorker() {
    this.connected=false;
    return this;
}

LocalWorker.prototype.send=function(str, callback) {
    var that=this;

    that.proc.send(str, function(err) {
        if (callback) callback(err);
    })
}

// callback=function(err) indicating the error of launching.
// if succ, err===null. otherwise an error.
LocalWorker.prototype.launch=function(callback) {
    var that=this;

    that.proc=childprocess.fork("./localkernel/entry", [], [0, 1, 2, "ipc"]);
    that.proc.on("error", function(err) {
        // TODO handling with error
        console.error(err);
    });
    that.proc.once("message", function(message) {
        if ((msg.unmarshall(message)).type==="ready") {
            that.connected=true;
            if (callback) callback(null);
        }
    });
    that.proc.on("message", function(message) {
        if (that.onmessage!=null) {
            setImmediate(function() {
                that.onmessage(message);
            });
        }
    });

    that.send(msg.marshall({
        type: "init",
    }));
}

// callback=function(err) indicating the error of terminating.
// if succ, err===null. otherwise an error.
LocalWorker.prototype.terminate=function(callback) {
    setImmediate(function() {
        callback(null);
    });
}

module.exports=LocalWorker;
