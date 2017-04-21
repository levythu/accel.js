var DisEnv=require("../kernel/environment");
var Queue=require("../utils/queue");
var msg=require("../communication/marshall");
var accel=require("../index");

var CMsgRouter=require("../kernel/cmsgrouter");

var envList=[];
var taskQueue=new Queue();

var workerList={};
var uid=1;
var pendingTasks={};
var msgRouter;

function sendWork(theTask, targetWorker) {
    pendingTasks[uid]=theTask;

    var worker=workerList[targetWorker];
    worker.wantTask--;

    var task=[{
        envId: theTask.envId,
        functionKey: theTask.functorKey,
        stringArgList: theTask.marshalledArgs,
        tag: uid+"",
    }];
    var addons=[];

    if (!worker._envVersion) worker._envVersion={};
    if (!worker._envVersion[theTask.envId]) worker._envVersion[theTask.envId]={};
    var patch=envList[theTask.envId].makePatch(worker._envVersion[theTask.envId]);
    worker._envVersion[theTask.envId]=envList[theTask.envId].makeVersion();

    if (Object.keys(patch).length>0) {
        addons.push({
            envId: theTask.envId,
            patch: patch,
        });
    };

    var obj2Send={
        type: "push",
        task: task,
    };
    if (addons.length>0) obj2Send.addons=addons;
    worker.send(msg.marshall(obj2Send));
    uid++;
}
// called when a new task is placed in the queue
function onNewTaskOrWorker() {
    var idList=Object.keys(workerList);
    while (true) {
        if (taskQueue.GetLen()==0) return;
        // TODO implement bette scheduling
        var targetWorker=null;
        for (var i=idList.length; i>0; i--) {
            var rPos=Math.floor(Math.random()*i);
            var id=idList[rPos];
            idList[rPos]=idList[i-1];
            if (typeof(workerList[id].wantTask)==="number" && workerList[id].wantTask>0) {
                targetWorker=id;
                break;
            }
        }
        if (targetWorker==null) return;
        var theTask=taskQueue.DeQueue();
        sendWork(theTask, targetWorker);
    }
}

function createNewEnv() {
    envList.push(null);
    (function(theElem) {
        envList[theElem]=new DisEnv(function(functorKey, args, options) {
            // options={
            //     urgent: true,
            //     to: [0, 1, 2, 3, ...],   // or "all"
            // }
            if (args.length===0 || typeof(args[args.length-1])!=="function") {
                throw new Error("The last parameter must be a callback function!");
            }
            var cb=args.pop();
            if (options==null) options={};
            if ("to" in options) {
                var msa=msg.marshall(args);
                if (options.to==="all") {
                    options.to=Object.keys(workerList);
                }
                for (var i=0; i<options.to.length; i++) {
                    sendWork({
                        envId: theElem,
                        functorKey: functorKey,
                        marshalledArgs: msa,
                        options: options,
                        callback: cb,
                    }, options.to[i]);
                }
            } else {
                if (options.urgent===true) {
                    taskQueue.EnQueueFirst({
                        envId: theElem,
                        functorKey: functorKey,
                        marshalledArgs: msg.marshall(args),
                        options: options,
                        callback: cb,
                    });
                } else {
                    taskQueue.EnQueue({
                        envId: theElem,
                        functorKey: functorKey,
                        marshalledArgs: msg.marshall(args),
                        options: options,
                        callback: cb,
                    });
                }
                onNewTaskOrWorker();
            }
        });
    })(envList.length-1);
    return envList[envList.length-1].wrapper;
}

function onFinishInit() {
    accel.id=-1;
    accel.type="master";
    msgRouter=new CMsgRouter(workerList);
    accel._msgRouter=msgRouter;
}

// obj={msg, id}
function onMessage(obj) {
    var content=msg.unmarshall(obj.msg);
    if (!(obj.id in workerList)) {
        console.error("A message from non-exist worker is received: ", obj);
        return;
    }
    if (content.type==="pull") {
        var limit=typeof(content.maxtask)==="number"?content.maxtask:3;
        if (!("wantTask" in workerList[obj.id])) workerList[obj.id].wantTask=0;
        if (limit>workerList[obj.id].wantTask) workerList[obj.id].wantTask=limit;
        onNewTaskOrWorker();
    } else if (content.type==="report") {
        if (!(content.tag in pendingTasks)) {
            throw new Error("The task "+conteng.tag+" is not pending.");
        }
        var theTask=pendingTasks[content.tag];
        delete pendingTasks[content.tag];
        setImmediate(function() {
            theTask.callback.apply(undefined, content.result);
        });
        if (typeof(content.maxtask)==="number") {
            if (!("wantTask" in workerList[obj.id])) workerList[obj.id].wantTask=0;
            if (content.maxtask>workerList[obj.id].wantTask) workerList[obj.id].wantTask=content.maxtask;
            onNewTaskOrWorker();
        }
    } else if (content.type==="cmsg") {
        msgRouter.onMessage(content);
    }
}

exports.createNewEnv=createNewEnv;
exports.workerList=workerList;
exports.onFinishInit=onFinishInit;
exports.onMessage=onMessage;
