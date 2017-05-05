var k=require("./kernel");
var time=require("../timing");

const width = 1200;
const height = 800;
const maxIterations = 256;
const x0 = -2;
const x1 = 1;
const y0 = -1;
const y1 = 1;

time(() => {
    var res=k.mandel_range(x0, y0, x1, y1, width, height, 0, height, maxIterations, 0.2);
    var sum=0;
    for (var i=0; i<res.length; i++) sum+=res[i];
    console.log(sum);
}, 1);
