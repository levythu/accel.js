var accel=require("../lib/index");
var $=accel();

accel.init({}, function(err) {
    if (err) {
        console.log(err);
        return;
    }
    $.a=0.5;
    $.rand=function(next) {
        next = next * 1103515245 + 12345;
        return Math.floor(next/65536) % 32768;
    }
    $(function calculate(q, times) {
        for (var i=0; i<times; i++) q=$.rand(q);
        return q;
    });


    $(function remoteTimeCount(callback) {
        setTimeout(function() {
            callback("It's high noon!");
        }, 5000);
    }, "async");

    $.remoteTimeCount(function(result) {
        console.log(result);
    });
    $.calculate(1, 10000000, function(result) {
        console.log("Seed: 1, Times: 10M, Res:", result);
    });
    $.calculate(2, 10000000, function(result) {
        console.log("Seed: 2, Times: 10M, Res:", result);
    });
    $.calculate(3, 10000000, function(result) {
        console.log("Seed: 3, Times: 10M, Res:", result);
    });

});

setInterval(function(){}, 1000);
