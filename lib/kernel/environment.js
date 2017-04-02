var DisVar=require("./disvar");

var handler = {
    get: function(target, key) {
        return target[key] instanceof DisVar?target[key].get():undefined;
    },
    set: function(target, key, value, receiver) {
        if (target[key] instanceof DisVar) {
            target[key].put(value);
        } else {
            target[key]=new DisVar();
            target[key].put(value);
        }
        return true;
    },
    deleteProperty: function(target, key) {
        if (target[key] instanceof DisVar) {
            target[key].put(undefined);
        }
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
        if (target[key] instanceof DisVar) {
            target[key].put(argumentsList[0]);
        } else {
            target[key]=new DisVar();
            target[key].put(argumentsList[0]);
        }
    }
};

function DisEnv() {
    this.actualData=function(){};
    this.wrapper=new Proxy(this.actualData, handler);
}

module.exports=DisEnv;
