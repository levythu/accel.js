var conf=require("./conf");
var msg=require("../communication/marshall");
var accel;

function CMsgRouter(workerList) {
    this.MsgObjMap={};
    this.workerList=workerList;
    if (accel==null) {
        accel=require("../index");
    }
}

CMsgRouter.prototype.Register=function(MsgObj) {
    // console.log(MsgObj._GetUID(), "registered for", accel.id);
    this.MsgObjMap[MsgObj._GetUID()]=MsgObj;
};

CMsgRouter.prototype._pushMessage=function(uid, content) {
    if (!(uid in this.MsgObjMap)) {
        return;
    }
    this.MsgObjMap[uid]._OnMessage(content);
}

CMsgRouter.prototype.OnMessage=function(obj) {
    this._pushMessage(obj.uid, obj.c);
};

CMsgRouter.prototype.Send=function(MsgObj, to, c) {
    var that=this;
    if (to===accel.id) {
        setImmediate(() => {
            that._pushMessage(MsgObj._GetUID(), c);
        });
    } else {
        if (!(to in that.workerList)) {
            throw new Error("The worker is not available");
        }
        that.workerList[to].send(msg.marshall({
            type: "cmsg",
            uid: MsgObj._GetUID(),
            c: c,
        }));
    }
};
module.exports=CMsgRouter;
