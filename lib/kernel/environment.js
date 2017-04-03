var DisVar=require("./disvar");
var sandbox=require("../worker/localkernel/sandbox");

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
            return target[key] instanceof DisVar?target[key].get():undefined;
        },
        set: function(target, key, value, receiver) {
            if (target[key] instanceof DisVar) {
            } else {
                target[key]=new DisVar();
            }
            if (typeof(value)==="function") {
                target[key].put(that.funcEmitter(key));
                target[key].originFunc=value;
                target[key].funcMode="sync";
            } else {
                target[key].put(value);
                target[key].originFunc=undefined;
            }
            that.epic++;
            return true;
        },
        deleteProperty: function(target, key) {
            if (target[key] instanceof DisVar) {
                that.epic++;
                target[key].put(undefined);
                target[key].originFunc=undefined;
            }
            return true;
        },
        has: function(target, key) {
            return (target[key] instanceof DisVar && target[key].get()!==undefined);
        },
        apply: function(target, thisArg, argumentsList) {
            if (typeof(argumentsList[0])!=="function") {
                throw "Argument must be a named function";
            }
            if (argumentsList[0].name==="") {
                throw "Argument must be a named function";
            }
            var key=argumentsList[0].name;
            var value=argumentsList[0];
            if (target[key] instanceof DisVar) {
            } else {
                target[key]=new DisVar();
            }
            that.epic++;
            target[key].put(that.funcEmitter(key));
            target[key].originFunc=value;
            if (typeof(argumentsList[1])==="string") target[key].funcMode=argumentsList[1];
            else target[key].funcMode="sync";
        }
    };
    this.wrapper=new Proxy(this.actualData, this.handler);
}

DisEnv.prototype.makeVersion=function() {
    var version={};
    for (i in this.actualData) {
        if (this.actualData[i] instanceof DisVar) {
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
        if (this.actualData[i] instanceof DisVar) {
            if ((!(i in version)) || (version[i]<this.actualData[i].version)) {
                if (this.actualData[i].originFunc!=undefined) {
                    patch[i]={
                        version: this.actualData[i].version,
                        fvalue: this.actualData[i].originFunc.toString(),
                        mode: this.actualData[i].funcMode,
                    }
                } else {
                    patch[i]={
                        version: this.actualData[i].version,
                        value: this.actualData[i].value,
                    }
                }
            }
        }
    }
    return patch;
}

DisEnv.prototype.syncWithPatch=function(patch) {
    for (i in patch) {
        if (!(this.actualData[i] instanceof DisVar)) {
            this.actualData[i]=new DisVar();
        }
        if (patch[i].fvalue!=null) {
            this.actualData[i].version=patch[i].version;
            this.actualData[i].value=this.funcEmitter(i);
            this.actualData[i].originFunc=sandbox.fromStrToFunc(patch[i].fvalue, this.wrapper);
            this.actualData[i].funcMode=patch[i].mode;
        } else {
            this.actualData[i].version=patch[i].version;
            this.actualData[i].value=patch[i].value
            this.actualData[i].originFunc=undefined;
        }
    }
}

module.exports=DisEnv;
