var accel=require("accel");
var $=accel();
var getUUID=require("./randomGen");
$.Fontmin=accel.require('fontmin');
$.fs=accel.require("fs");

$(function run(filename, callback) {
    if ($.text==null) $.text=$.fs.readFileSync("res/src", {encoding:'utf8'});
    var fontmin = new $.Fontmin()
        .src('res/stsong.ttf')
        .use($.Fontmin.glyph({
            text: $.text,
            hinting: false         // keep ttf hint info (fpgm, prep, cvt). default = true
        }))
        .dest('res/'+filename+".ttf");
    fontmin.run(function (err, files) {
        if (err) {
            console.error(err);
            return;
        }

        callback(filename);
    });
}, "async");

module.exports=function(callback) {
    var filename=getUUID.GenerateUUID();
    $.run(filename, callback);
}
