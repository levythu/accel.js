function DumbWorker() {
    return this;
}

DumbWorker.prototype.send=function(str) {
    // NOTHING
}

// callback=function(err) indicating the error of launching.
// if succ, err===null. otherwise an error.
DumbWorker.prototype.launch=function(callback) {
    setImmediate(function() {
        callback(null);
    });
}

// callback=function(err) indicating the error of terminating.
// if succ, err===null. otherwise an error.
DumbWorker.prototype.terminate=function(callback) {
    setImmediate(function() {
        callback(null);
    });
}

module.exports=DumbWorker;
