var request = require('request');

var dns="ec2-34-200-242-90.compute-1.amazonaws.com:2333";
var url='http://'+dns+"/s";

var requester=10;

var count=0;
var totalResponseTime=0;
var cacheHitResponseTime=0;
var totalCacheHitTime=0;
var time=0;
var totalCount=0;

var requestedNumber=0;
var cacheHitRate=0.5;
function rq() {
    var nowTime=(new Date()).getTime();

    var thisNumber;
    var cacheHit=false;
    if (Math.random()<cacheHitRate) {
        thisNumber=0;
        cacheHit=true;
    } else {
        thisNumber=requestedNumber;
        requestedNumber++;
    }

    request(url+"?text="+thisNumber, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var thisTime=(new Date()).getTime();
            totalResponseTime+=thisTime-nowTime;
            totalCount++;
            count++;
            if (cacheHit) {
                totalCacheHitTime++;
                cacheHitResponseTime+=thisTime-nowTime;
            }
            process.nextTick(rq);
        }
    })
}

for (var i=0; i<requester; i++) {
    process.nextTick(rq);
}

setInterval(function() {
    count=0;
    time++;
}, 1000);

setInterval(function() {
    if (totalCount==0) console.log(0, 0, 0);
    else console.log((totalResponseTime/totalCount), (totalCount/time), (totalCacheHitTime>0?cacheHitResponseTime/totalCacheHitTime:0));
}, 5000);
