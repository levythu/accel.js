var conf=require("./kernel/conf");
var os=require("os");

var accel=null;

if (conf.isMaster===true) {
    var master=require("./master/clustermanager");
    var LocalWorker=require("./worker/LocalWorker");
    accel=master.createNewEnv;
    // workerList{"0"} is reserved for master
    accel.init=function(newConf, callback) {
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
                totalNumber+=conf.env[i].local;
            } else {
                throw "Unsupported Worker Type";
            }
        }
        function launchNewLocalWorker() {
            nowNumber++;
            var t=new LocalWorker(nowNumber);
            t.onmessage=master.onMessage;
            t.launch(function(err) {
                if (err!=null) {
                    // TODO
                }
                master.workerList[nowNumber]=t;
                if (nowNumber==totalNumber) {
                    master.onFinishInit();
                    callback(null);
                }
            });
        }
        for (var i=0; i<conf.env.length; i++) {
            if (typeof(conf.env[i].local)==="number") {
                for (var j=0; j<conf.env[i].local; j++) launchNewLocalWorker();
            }
        }
    };
} else {
    // Temporary nothing
}

module.exports=accel;
