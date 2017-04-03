var DisEnv=require("../kernel/environment");
var Queue=require("../utils/queue");
var msg=require("../communication/marshall");

var envList=[];
var taskQueue=new Queue();

var workerList={};
var uid=1;
var pendingTasks={};

// called when a new task is placed in the queue
function onNewTaskOrWorker() {
    if (taskQueue.GetLen()==0) return;
    // TODO implement bette scheduling
    var targetWorker=null;
    for (id in workerList) {
        if (typeof(workerList[id].wantTask)==="number" && workerList[id].wantTask>0) {
            targetWorker=id;
            break;
        }
    }
    if (targetWorker==null) return;
    var theTask=taskQueue.DeQueue();
    pendingTasks[uid]=theTask;

    // TODO send the delta instead
    var patch=envList[theTask.envId].makePatch({});
    workerList[targetWorker].send(msg.marshall({
        type: "push",
        task: [
            {
                envId: theTask.envId,
                functionKey: theTask.functorKey,
                stringArgList: theTask.marshalledArgs,
                tag: uid+"",
            }
        ],
        addons: [
            {
                envId: theTask.envId,
                patch: patch,
            }
        ],
    }));
    uid++;
}

function createNewEnv() {
    envList.push(null);
    (function(theElem) {
        envList[theElem]=new DisEnv(function(functorKey, args) {
            if (args.length===0 || typeof(args[args.length-1])!=="function") {
                throw new Error("The last parameter must be a callback function!");
            }
            var cb=args.pop();
            taskQueue.EnQueue({
                envId: theElem,
                functorKey: functorKey,
                marshalledArgs: msg.marshall(args),
                callback: cb,
            });
            onNewTaskOrWorker();
        });
    })(envList.length-1);
    return envList[envList.length-1].wrapper;
}

function onFinishInit() {

}

// obj={msg, id}
function onMessage(obj) {
    var content=msg.unmarshall(obj.msg);
    if (!(obj.id in workerList)) {
        console.error("A message from non-exist worker is received: ", obj);
        return;
    }
    if (content.type==="pull") {
        var limit=typeof(content.maxtask)==="number"?content.maxtask:10000;
        workerList[obj.id].wantTask=limit;
        onNewTaskOrWorker();
    }
}

exports.createNewEnv=createNewEnv;
exports.workerList=workerList;
exports.onFinishInit=onFinishInit;
exports.onMessage=onMessage;
