var accel=require("../lib/index");
var $=accel();

// accel.init({env: [{remote:2,endpoint:"127.0.0.1",port:12345}]}, function(err) {
accel.init({env: [{local: 4}]}, function(err) {
    $(function remoteTimeCount(callback) {
        setTimeout(function() {
            callback("It's high noon!");
        }, 5000);
    }, "async");

    $.remoteTimeCount(function(result) {
        console.log(result);
        accel.exit(0);
    });
});
