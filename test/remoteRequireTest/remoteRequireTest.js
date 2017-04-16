var accel=require("../../lib/index");
var $=accel();

$.os=accel.require("os");

function profile() {
    return "Master: "+process.pid+", "+$.os.platform();
}

accel.init({}, function(err) {
    console.log(profile());
    $(profile)(function(r) {
        console.log(r);
    });
});

setInterval(function(){}, 1000);
