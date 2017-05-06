var accel=require("accel");
var $=accel();
$.time=require("../timing");
$.k=accel.require("./kernel");

const width = 6000;
const height = 4000;
const maxIterations = 256;
const x0 = -2;
const x1 = 1;
const y0 = -1;
const y1 = 1;

$(function mandel_range_remote() {
    var sum=0;
    $.time(() => {
        var res=$.k.mandel_range.apply(null, Array.from(arguments));
        for (var i=0; i<res.length; i++) sum+=res[i];
    })
    return sum;
});


var now=(new Date()).getTime();
var times=1;
function onFinish(res) {
    console.log(res);

    times--;
    if (times>0) {
        console.log("Left", times);
        $.mandel_range_remote(x0, y0, x1, y1, width, height, 0, height, maxIterations, onFinish);
    } else {
        var after=(new Date()).getTime();
        console.log("Running", 1, "times with time", after-now, "ms");
        return after-now;
    }
}

$.mandel_range_remote(x0, y0, x1, y1, width, height, 0, height, maxIterations, onFinish);
