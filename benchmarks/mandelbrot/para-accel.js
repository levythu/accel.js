var time=require("../timing");

var accel=require("accel");
var $=accel();
$.k=accel.require("./kernel");

const width = 26000;
const height = 4000;
const maxIterations = 256;
const chunkSize=10;
const x0 = -2;
const x1 = 1;
const y0 = -1;
const y1 = 1;

$(function mandel_range_remote() {
    var res=$.k.mandel_range.apply(null, Array.from(arguments));
    var sum=0;
    for (var i=0; i<res.length; i++) sum+=res[i];
    return sum;
});


var now=(new Date()).getTime();
var sum=0;
var count=0;
function onFinish(res) {
    sum+=res;
    count++;
    if (count==height/chunkSize) {
        console.log(sum);
        var after=(new Date()).getTime();
        console.log("Running", 1, "times with time", after-now, "ms");
        return after-now;
    }
}

for (var i=0; i<height; i+=chunkSize) {
    $.mandel_range_remote(x0, y0, x1, y1, width, height, i, chunkSize, maxIterations, onFinish);
}
