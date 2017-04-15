var accel=require("../../index");

// from str to function, replenishing corresponding variables
function fromStrToFunc(funcString, envWrapper) {
    var $=envWrapper;
    return eval("("+funcString+")");
}

// from str to function,
function fromStrToFuncNoEnv(funcString) {
    return eval("("+funcString+")");
}

exports.fromStrToFunc=fromStrToFunc;
exports.fromStrToFuncNoEnv=fromStrToFuncNoEnv;
