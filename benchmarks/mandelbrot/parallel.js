var time = require("../timing");
var Parallel = require("paralleljs")

const width = 6000;
const height = 4000;
const maxIterations = 256;
const chunkSize = 50;
const x0 = -2;
const x1 = 1;
const y0 = -1;
const y1 = 1;
var now = (new Date()).getTime();
var sum = 0;
var count = 0;

for (var i = 0; i < height; i += chunkSize) {
    let p = new Parallel([x0, y0, x1, y1, width, height, maxIterations, i, chunkSize]);
    p.spawn(data => {
            var k = require("../../../benchmarks/mandelbrot/kernel");
            var res = k.mandel_range(data[0], data[1], data[2], data[3], data[4], data[5], data[7], data[8], data[6]);
            var sum = 0;
            for (var i = 0; i < res.length; i++) sum += res[i];
            return sum;
        })
        .then(data => {
            count++;
            sum += data;
            if (count == height / chunkSize) {
                console.log(sum);
                var after = (new Date()).getTime();
                console.log("Running", 1, "times with time", after - now, "ms");
            }
        });
}
