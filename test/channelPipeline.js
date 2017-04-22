var accel=require("../lib/index");
var $=accel();

var nop=()=>1;
accel.init({env: [{local: 2}]}, function(err) {
    $.c1=new accel.Channel(5);
    $.c2=new accel.Channel(5);
    $.o=new accel.Channel(5);
    $.it=100000;
    $.rand=function(next) {
        next = next * 1103515245 + 12345;
        return Math.floor(next/65536) % 32768;
    }
    $(()=>{
        console.log("Worker", accel.id, "online");
        $.c1.Dump((num) => {
            console.log("Worker", accel.id, "receives", num);
            for (var i=0; i<$.it; i++) num=$.rand(num);
            $.c2.Send(num);
            return true;
        })
    }, "async").to(0)(nop);

    $(()=>{
        console.log("Worker", accel.id, "online");
        $.c2.Dump((num) => {
            console.log("Worker", accel.id, "receives", num);
            for (var i=0; i<$.it; i++) num=$.rand(num);
            $.o.Send(num);
            return true;
        })
    }, "async").to(1)(nop);

    $.o.Dump((num) => {
        console.log("Get result", num);
        return true;
    });
    for (var i=0; i<1000; i++) {
        $.c1.Send(i);
    }
});
