var DisVar=require("./disvar");
var RemoteRequire=require("./remoteRequire");
var Channel=require("./channel");

var allTypes=[DisVar.DisVar, DisVar.DisFunc, RemoteRequire, Channel];
var typeMap={};
for (var i=0; i<allTypes.length; i++) {
    typeMap[allTypes[i].name]=allTypes[i];
}

exports.Shadow=function(disvar) {
    var shadow=disvar.shadow();
    shadow._=disvar.constructor.name
    return shadow;
}

// env is the disEnv, key is the key that the disvar should be
exports.Clone=function(shadow, env, key) {
    if (!(shadow._ in typeMap)) {
        throw new Error("Not supported dis var.");
    }
    var res=new (typeMap[shadow._])();
    res.clone(shadow, env, key);
    return res;
}
