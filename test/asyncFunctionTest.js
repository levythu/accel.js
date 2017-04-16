var accel=require("../lib/index");
var $=accel();

accel.init({}, function(err) {
    $(function remoteTimeCount(callback) {
        setTimeout(function() {
            callback("It's high noon!", 0, 8, 1, 8);
        }, 5000);
    }, "async");

    $.remoteTimeCount(function(result, a1, a2, a3, a4) {
        console.log(result, a1, a2, a3, a4);
    });
});
