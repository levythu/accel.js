var accel=require("../lib/index");
var $=accel();

var nop=()=>1;
accel.init({}, function(err) {
    $(function Fibb(x1, x2, n, cb) {
        if (n==0) cb(x2);
        else $.Fibb(x2, x1+x2, n-1, cb);
    }, "async");
    $.Fibb(0, 1, 4, (res) => console.log(res));
});
