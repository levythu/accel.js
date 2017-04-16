var DisVar=require("./disvar").DisVar;
var DisFunc=require("./disvar").DisFunc;
var sandbox=require("../worker/localkernel/sandbox");
var types=require("./types");
var rand=require("../utils/randomGen");

// onEmit=function(functorKey, argList)
function DisEnv(onEmit) {
    var that=this;

    this.onEmit=onEmit;
    this.actualData=function(){};
    this.epic=0;
    this.funcEmitter=function(functorKey) {
        return function() {
            onEmit(functorKey, Array.from(arguments));
        };
    };
    this.handler={
        get: function(target, key) {
            return target[key] && "__isDis" in target[key]?target[key].get():undefined;
        },
        set: function(target, key, value, receiver) {
            if (typeof(value)==="object" && "__isDis" in value) {
                // itself is a disvar, don't warp it.
                target[key]=value;
                target[key].version=target[key]?target[key].version+1:0;
            } else {
                target[key]=new DisVar(target[key]);
                target[key].put(value);
            }
            that.epic++;
            return true;
        },
        deleteProperty: function(target, key) {
            if (target[key] && "__isDis" in target[key]) {
                target[key]=new DisVar(target[key]);
                target[key].put(undefined);
                that.epic++;
            }
            return true;
        },
        has: function(target, key) {
            return (target[key] && "__isDis" in target[key] && target[key].get()!==undefined);
        },
        apply: function(target, thisArg, argumentsList) {
            if (typeof(argumentsList[0])!=="function") {
                throw new Error("Argument must be a named function");
            }
            var key;
            if (argumentsList[0].name==="") {
                key="$Anonym#"+rand.GenerateUUID("1");
            } else {
                key=argumentsList[0].name;
            }
            var value=argumentsList[0];
            target[key]=new DisFunc(target[key]);
            that.epic++;
            target[key].put(that.funcEmitter(key), value, typeof(argumentsList[1])==="string"?argumentsList[1]:"sync");
            return target[key].get();
        }
    };
    this.wrapper=new Proxy(this.actualData, this.handler);
}

DisEnv.prototype.makeVersion=function() {
    var version={};
    for (i in this.actualData) {
        if ("__isDis" in this.actualData[i]) {
            version[i]=this.actualData[i].version;
        }
    }
    version.__epic=this.epic;
    return version;
}

DisEnv.prototype.makePatch=function(version) {
    var patch={};
    if (version.__epic===this.epic) return {};
    for (i in this.actualData) {
        if ("__isDis" in this.actualData[i]) {
            if ((!(i in version)) || (version[i]<this.actualData[i].version)) {
                patch[i]=types.Shadow(this.actualData[i]);
            }
        }
    }
    return patch;
}

DisEnv.prototype.syncWithPatch=function(patch) {
    for (i in patch) {
        this.actualData[i]=types.Clone(patch[i], this, i);
    }
}

module.exports=DisEnv;
