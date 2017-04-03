var accel=require("../lib/index");
var $=accel();

accel.init({
    env: [
        {
            local: 1,
        },
    ],
}, function(err) {
    if (err) {
        console.log(err);
        return;
    }
    $.a=0.5;
    $(function add(a, b) {
        return a*$.a+b*(1-$.a);
    });

    $.add(10, 4, function(result) {
        console.log(result);    // 7
    });

});

setInterval(function(){}, 1000);
