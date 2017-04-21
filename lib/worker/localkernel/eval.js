var DisEnv=require("../../kernel/environment");

var accel=require("../../index");
var envMap={};
var msg=require("../../communication/marshall");

function syncEnv(envId, patch) {
    if (!(envId in envMap)) {
        envMap[envId]=new DisEnv(function(functorKey, args, options) {
            if (args.length===0 || typeof(args[args.length-1])!=="function") {
                throw new Error("The last parameter must be a callback function!");
            }
            var cb=args.pop();
            if (options==null) options={};
            var taskObj={
                envId: envId,
                functionKey: functorKey,
                stringArgList: args,
                tag: "25",
            }
            function callback(rs) {
                cb.apply(null, rs);
            }
            if (options.urgent===true) {
                process.nextTick(() => executeTask(taskObj, callback, true));
            } else {
                setImmediate(() => executeTask(taskObj, callback, true));
            }
        });
    }
    envMap[envId].syncWithPatch(patch);
}

// one element in the task field in protocol `push`
function executeTask(taskObj, callback, parsedParameter=false) {
    var env=envMap[taskObj.envId];
    var $=env.wrapper;
    var funcToExecVar=env.actualData[taskObj.functionKey];
    var parameter=parsedParameter?taskObj.stringArgList:msg.unmarshall(taskObj.stringArgList);
    if (funcToExecVar.mode==="async") {
        parameter.push(function() {
            if (taskObj.functionKey.startsWith("$Anonym#")) {
                // anonymous function, discard after call
                delete env.actualData[taskObj.functionKey];
            }
            callback(Array.from(arguments));
        });
        funcToExecVar.originFunc.apply($, parameter);
    } else {
        var res=funcToExecVar.originFunc.apply($, parameter);
        if (taskObj.functionKey.startsWith("$Anonym#")) {
            // anonymous function, discard after call
            delete env.actualData[taskObj.functionKey];
        }
        callback([res]);
    }
}

exports.executeTask=executeTask;
exports.syncEnv=syncEnv;
