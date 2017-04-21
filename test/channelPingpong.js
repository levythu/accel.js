var accel=require("../lib/index");
var $=accel();

var nop=()=>1;
accel.init({env: [{local: 4}]}, function(err) {
    $.c=new accel.Channel();
    $.pingpong=function() {
        $.c.Recv((what) => {
            setTimeout(() => {
                console.log("Node", accel.id, what);
                $.c.Send(what=="Ping"?"Pong":"Ping", () => {
                    $.pingpong();
                });
            }, Math.random()*500+100);
        });
    }
    $(function run(callback) {
        $.pingpong();
    }, "async");

    $.run.toAll()(nop);
    $.c.Send("Ping", () => console.log("Master: Ping"));
});
