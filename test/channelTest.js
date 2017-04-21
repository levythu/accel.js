var accel=require("../lib/index");
var $=accel();

var nop=()=>1;
accel.init({env: [{local: 4}]}, function(err) {
    $.c=new accel.Channel();
    $.waitForMsg=function(callback) {
        $.c.Recv((what) => {
            console.log("Node", accel.id, "Receives:", what);
            callback();
        });
    };
    $(function run(callback) {
        $.waitForMsg($.waitForMsg);
    }, "async");

    for (var i=0; i<4; i++) {
        $.run(nop);
    }
    $.c.Send("Huahua");
});
