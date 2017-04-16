var accel=require("../../lib/index");
var $=accel();

$.refed=accel.require("./refed");

accel.init({}, function(err) {
    if (err) {
        console.log(err);
        return;
    }
    $.refed.foo();
    $(function someOne() {
        $.refed.foo();
    })(function(){});
});

setInterval(function(){}, 1000);
