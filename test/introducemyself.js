var accel=require("../lib/index");
var $=accel();

accel.init({env: [{local: 4}]}, function(err) {
    if (err) {
        console.log(err);
        return;
    }

    $(function introduce() {
        return "I'm node"+accel.id;
    });

    function reportResult(result) {
        console.log(result);
    }
    $.introduce(reportResult);
    $.introduce(reportResult);
    $.introduce(reportResult);
    $.introduce(reportResult);
    $.introduce(reportResult);
    $.introduce(reportResult);
    $.introduce(reportResult);
    $.introduce(reportResult);
});

setInterval(function(){}, 1000);
