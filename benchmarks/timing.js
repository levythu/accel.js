module.exports=function time(func, times=1) {
    var now=(new Date()).getTime();
    for (var i=0; i<times; i++) {
        func();
    }
    var after=(new Date()).getTime();
    console.log("Running", times, "times with time", after-now, "ms");
    return after-now;
}
