var conf=require("./kernel/conf");
var os=require("os");
var caller=require("caller");
var path=require("path");

var RemoteRequire=require("./kernel/remoteRequire");

var accel=null;

if (conf.isMaster===true) {
    var master=require("./master/clustermanager");
    var LocalWorker=require("./worker/LocalWorker");
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
            } else {
                throw "Unsupported Worker Type";
            }
        }
        var finished=0;
        function launchNewLocalWorker() {
            var thisNumber=nowNumber++;
            var t=new LocalWorker(thisNumber);
            t.onmessage=master.onMessage;
            t.launch(function(err) {
                if (err!=null) {
                    // TODO
                }
                master.workerList[thisNumber]=t;
                finished++;
                if (finished==totalNumber) {
                    master.onFinishInit(accel);
                    if (callback) callback(null);
                }
            });
        }
        for (var i=0; i<conf.env.length; i++) {
            if (typeof(conf.env[i].local)==="number") {
                for (var j=0; j<conf.env[i].local; j++) launchNewLocalWorker();
            }
        }

        setInterval(function(){}, 1000);
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
