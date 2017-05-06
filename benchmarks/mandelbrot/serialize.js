var k=require("./kernel");
var time=require("../timing");

const width = 6000;
const height = 4000;
const maxIterations = 256;
const x0 = -2;
const x1 = 1;
const y0 = -1;
const y1 = 1;

var run=() => {
    var res=k.mandel_range(x0, y0, x1, y1, width, height, 0, height, maxIterations);
    var sum=0;
    for (var i=0; i<res.length; i++) sum+=res[i];
    console.log(sum);
};
time(run, 1);

var run2=eval("("+run.toString()+")");
