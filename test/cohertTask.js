var accel=require("../lib/index");
var $=accel();

accel.init({env: [{local: 4}]}, function() {
    $(function() {
        return "I'm node "+accel.id;
    }).toAll()((res) => {
        console.log(res);
    })
});
