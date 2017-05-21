// LocalWorker is implemented by
var childprocess = require("child_process");
var msg = require("../communication/marshall");
var path = require('path');
var conf = require("../kernel/conf")

function LocalWorker(id) {
    this.connected = false;
    this.id = id;
    return this;
}

LocalWorker.prototype.send = function(str, callback) {
    this.socket.sendMessage(str);
    if (callback)
        callback();
}

// callback=function(err) indicating the error of launching.
// if succ, err===null. otherwise an error.
LocalWorker.prototype.launch = function(callback) {
    var that = this;

    that.proc = childprocess.fork(path.join(__dirname, "./localkernel/entry"), ["127.0.0.1", conf.listenPort], [0, 1, 2, "ipc"]);
}

// callback=function(err) indicating the error of terminating.
// if succ, err===null. otherwise an error.
LocalWorker.prototype.terminate = function(callback) {
    if (callback)
        setImmediate(function() {
            callback(null);
        });
}

module.exports = LocalWorker;
