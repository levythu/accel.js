var conf=require("./conf");
var accel;
var rand=require("../utils/randomGen");
var Queue=require("../utils/queue");

// @ Force
function Channel(bufferSize=0) {
    if (accel==null) {
        accel=require("../index");
    }
    // @ Force
    this.version=0;
    // @ Force
    this.__isDis=true;

    this.uuid="Chan#"+rand.GenerateUUID(1);
    this.bufferSize=bufferSize;
    this.registered=false;
    this.sendingMessages=new Queue();
    this.receivingMessages=new Queue();

    this.buffer=new Queue();
    this.request=new Queue();
}

Channel.prototype.put=function(val) {
    throw new Error("Remote require is read-only");
}

// @ Force
Channel.prototype.get=function() {
    return this;
}

// @ Force
Channel.prototype.shadow=function() {
    return {
        v: this.version,
        i: this.uuid,
        b: this.bufferSize,
    };
}

// @ Force
Channel.prototype.clone=function(shadow, env, key) {
    this.version=shadow.v;
    this.uuid=shadow.i;
    this.bufferSize=shadow.b;
    accel._msgRouter.Register(this);
    this.registered=true;
}

Channel.prototype._tryToDispense=function() {
    while (this.buffer.GetLen()>0 && this.request.GetLen()>0) {
        var puller=this.request.DeQueue();
        var pusher=this.buffer.DeQueue();
        accel._msgRouter.Send(this, puller.f, {
            s: pusher.ps,
        });
        if (pusher.hasResponded!==true)
            accel._msgRouter.Send(this, pusher.f, {
                r: 1,
            });
    }
}

// @ Interface: MsgObj
Channel.prototype._OnMessage=function(content) {
    if ("ps" in content || "pl" in content) {
        if (conf.isMaster) {
            if ("ps" in content) {
                if (this.buffer.GetLen()<this.bufferSize) {
                    content.hasResponded=true;
                    accel._msgRouter.Send(this, content.f, {
                        r: 1,
                    });
                }
                this.buffer.EnQueue(content);
            }
            if ("pl" in content) this.request.EnQueue(content);
            this._tryToDispense();
        }
    } else if ("s" in content) {
        var callback=this.receivingMessages.DeQueue();
        if (callback) setImmediate(() => callback(content.s));
    } else if ("r" in content) {
        var callback=this.sendingMessages.DeQueue();
        if (callback) setImmediate(() => callback());
    }
}

Channel.prototype._GetUID=function() {
    return this.uuid;
}

Channel.prototype.Send=function(obj, callback) {
    if (!this.registered) {
        accel._msgRouter.Register(this);
        this.registered=true;
    }
    this.sendingMessages.EnQueue(callback);
    accel._msgRouter.Send(this, -1, {
        f: accel.id,
        ps: obj,
    });
}

Channel.prototype.Recv=function(callback) {
    if (!this.registered) {
        accel._msgRouter.Register(this);
        this.registered=true;
    }
    this.receivingMessages.EnQueue(callback);
    accel._msgRouter.Send(this, -1, {
        f: accel.id,
        pl: 1,
    });
}

module.exports=Channel;
