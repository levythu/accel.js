var accel=require("../lib/index");
var $=accel();

$.os=accel.require("os");

accel.init({}, function() {
    function printResult(res) {
        console.log(res);
    }
    $((res) => "Anonymous Function 1")(printResult);
    $((res) => "Anonymous Function 2")(printResult);
    $((res) => "Anonymous Function 3")(printResult);
    $((res) => "Anonymous Function 4")(printResult);
});

setInterval(function(){}, 1000);
