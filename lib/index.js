var conf=require("./kernel/conf");
var os=require("os");
var caller=require("caller");
var path=require("path");

var RemoteRequire=require("./kernel/remoteRequire");
var SocketServer=require("./socket/socketserver");
var accel=null;

if (conf.isMaster===true) {
    var master=require("./master/clustermanager");
    var LocalWorker=require("./worker/LocalWorker");
    var RemoteWorker=require("./worker/RemoteWorker");
    accel=master.createNewEnv;

    accel.init=function(newConf, callback) {
        if (newConf==null) newConf={};
        if ("env" in newConf) {
            conf.env=newConf.env;
        } else {
            conf.env=[
                {
                    local: os.cpus().length,
                }
            ];
        }

        var totalNumber=0;
        var nowNumber=0;
        for (var i=0; i<conf.env.length; i++) {
            if (typeof(conf.env[i].local)==="number") {
                if (conf.env[i].local==-1) conf.env[i].local=os.cpus().length;
                totalNumber+=conf.env[i].local;
            } else if (typeof(conf.env[i].remote)==="number") {
                totalNumber+=conf.env[i].remote;
            } else {
                throw "Unsupported Worker Type";
            }
        }

        var finished=0;
        // listen
        master.socketServer = new SocketServer(master.onMessage, function() {
            finished++;
            if (finished===totalNumber) {
                // assign socket to workers
                for (var i in master.socketServer.sockets) {
                    master.workerList[i.toString()].socket = master.socketServer.sockets[i].socket;
                }
                master.socketServer.broadcastPorts();
            }
        }, function() {
            finished++;
            if (finished===totalNumber * 2) {
                master.onFinishInit(accel);
                if (callback) callback(null);
            }
        });

        function launchNewLocalWorker() {
            var thisNumber=nowNumber++;
            var t=new LocalWorker(thisNumber);
            t.onmessage=master.onMessage;
            master.workerList[thisNumber]=t;
            t.launch();
        }
        function launchNewRemoteWorker(endpoint, port) {
            var thisNumber=nowNumber++;
            var t=new RemoteWorker(thisNumber, endpoint, port);
            t.onmessage=master.onMessage;
            master.workerList[thisNumber]=t;
            t.launch();
        }
        for (var i=0; i<conf.env.length; i++) {
            if (typeof(conf.env[i].local)==="number") {
                for (var j=0; j<conf.env[i].local; j++) launchNewLocalWorker();
            }
            if (typeof(conf.env[i].remote)==="number") {
                for (var j=0; j<conf.env[i].remote; j++)
                    launchNewRemoteWorker(conf.env[i].endpoint, conf.env[i].port);
            }
        }

        setInterval(function(){}, 1000);
    };
    accel.exit=function(exitCode=0) {
        master.cleanup(exitCode);
    };
} else {
    // Temporary nothing
    accel={};
}

accel.conf=conf;
accel.require=function(src) {
    var ret=new RemoteRequire();
    if (src.startsWith("./") || src.startsWith("../") || src.startsWith("/")) {
        src=path.resolve(path.dirname(caller()), src);
    }
    ret.addSource(src);

    return ret;
}
accel.Channel=require("./kernel/channel");

module.exports=accel;
