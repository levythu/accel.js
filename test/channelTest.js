var accel=require("../lib/index");
var $=accel();

var nop=()=>1;
accel.init({env: [{local: 2}]}, function(err) {
    $.c=new accel.Channel(2);
    $(function run(callback) {
        console.log("Node", accel.id, "Running");
        setTimeout(() => {
            $.c.Recv((what) => {
                console.log("Node", accel.id, "Receives:", what);
                callback();
            });
        }, Math.random()*2000+1000);
    }, "async");

    $.run.toAll()(nop);
    $.c.Send("Message1", () => console.log("Message1 Sent"));
    $.c.Send("Message2", () => console.log("Message2 Sent"));
    $.c.Send("Message3", () => console.log("Message3 Sent"));
    $.c.Send("Message4", () => console.log("Message4 Sent"));
});
