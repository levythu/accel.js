var DisEnv=require("../../kernel/environment");

var accel=require("../../index");
var envMap={};
var msg=require("../../communication/marshall");

function syncEnv(envId, patch) {
    if (!(envId in envMap)) {
        envMap[envId]=new DisEnv(function() {
            // TODO
            console.error("Not implemented nested remote call");
        });
    }
    envMap[envId].syncWithPatch(patch);
}

// one element in the task field in protocol `push`
function executeTask(taskObj, callback) {
    var env=envMap[taskObj.envId];
    var $=env.wrapper;
    var funcToExecVar=env.actualData[taskObj.functionKey];
    var parameter=msg.unmarshall(taskObj.stringArgList);
    if (funcToExecVar.mode==="async") {
        parameter.push(function(res) {
            if (taskObj.functionKey.startsWith("$Anonym#")) {
                // anonymous function, discard after call
                delete env.actualData[taskObj.functionKey];
            }
            callback(res);
        });
        funcToExecVar.originFunc.apply($, parameter);
    } else {
        var res=funcToExecVar.originFunc.apply($, parameter);
        if (taskObj.functionKey.startsWith("$Anonym#")) {
            // anonymous function, discard after call
            delete env.actualData[taskObj.functionKey];
        }
        callback(res);
    }
}

exports.executeTask=executeTask;
exports.syncEnv=syncEnv;
