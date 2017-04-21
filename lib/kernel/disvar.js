
var sandbox=require("../worker/localkernel/sandbox");

// @ Force
function DisVar(Pred) {
    if (Pred instanceof DisVar) return Pred;
    // @ Force
    this.version=0;
    // @ Force
    this.__isDis=true;
    if (Pred!=null && "version" in Pred)
        this.version=Pred.version;
    this.value=undefined;
}

DisVar.prototype.put=function(val) {
    this.version++;
    this.value=val;
}

// @ Force
DisVar.prototype.get=function() {
    return this.value;
}

// @ Force
DisVar.prototype.shadow=function() {
    if (typeof(this.value)==="function") {
        return {
            v: this.version,
            c: this.value.toString(),
            f: 1,
        };
    }
    return {
        v: this.version,
        c: this.value,
    };
}

// @ Force
DisVar.prototype.clone=function(shadow, env, key) {
    this.version=shadow.v;
    this.value="f" in shadow?sandbox.fromStrToFunc(shadow.c, env.wrapper):shadow.c;
}

module.exports.DisVar=DisVar;

//=============================================================================

function DisFunc(Pred) {
    if (Pred instanceof DisFunc) return Pred;
    this.version=0;
    this.__isDis=true;
    if (Pred!=null && "version" in Pred)
        this.version=Pred.version;
    this.originFunc=undefined;
    this.mode="";
}

DisFunc.prototype.addExtensions=function(someFunc) {
    var that=this;
    someFunc.urgent=function() {
        if (!that.opt) that.opt={};
        that.opt.urgent=true;
        return someFunc;
    };
    someFunc.to=function(list) {
        if (!that.opt) that.opt={};
        that.opt.to=list;
        return someFunc;
    };
    someFunc.toAll=function() {
        if (!that.opt) that.opt={};
        that.opt.to="all";
        return someFunc;
    };
    return someFunc;
}

DisFunc.prototype.put=function(val, originFunc, mode) {
    this.version++;
    this.value=this.addExtensions(val);
    this.originFunc=originFunc;
    this.mode=mode;
}

DisFunc.prototype.get=function() {
    return this.value;
}

DisFunc.prototype.shadow=function() {
    return {
        o: this.originFunc.toString(),
        m: this.mode,
        v: this.version,
    };
}

DisFunc.prototype.clone=function(shadow, env, key) {
    this.originFunc=sandbox.fromStrToFunc(shadow.o, env.wrapper);
    this.value=env.funcEmitter(key);
    this.mode=shadow.m;
    this.version=shadow.v;
}

module.exports.DisFunc=DisFunc;
