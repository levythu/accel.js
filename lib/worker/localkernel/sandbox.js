var accel=require("../../index");

// from str to function, replenishing corresponding variables
function fromStrToFunc(funcString, envWrapper) {
    var $=envWrapper;
    return eval("("+funcString+")");
}

exports.fromStrToFunc=fromStrToFunc;
