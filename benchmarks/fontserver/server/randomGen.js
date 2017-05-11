var charPool="1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";

exports.GenerateRandomString=function(length) {
    var res="";
    for (var i=0; i<length; i++) {
        res+=charPool[Math.floor(Math.random()*charPool.length)];
    }
    return res;
}

var launchTime=Date.now();
var uidCount=0;
exports.GenerateUUID=function(length) {
    appendix="";
    if (length==null || length==0) appendix="";
    else appendix=exports.GenerateRandomString(length)+"-";
    uidCount++;
    return appendix+launchTime+"-"+uidCount;
}
