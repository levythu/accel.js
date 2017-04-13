var Fontmin = require('fontmin');
var fs=require("fs");


var t=fs.readFileSync("text", {encoding:'utf8'});


function huahua() {
    var fontmin = new Fontmin()
        .src('fonts/*.ttf')
        .use(Fontmin.glyph({
            text: t,
            hinting: false         // keep ttf hint info (fpgm, prep, cvt). default = true
        }))
        .dest('res/');
    fontmin.run(function (err, files) {
        if (err) {
            throw err;
        }

        console.log(files[0]);
        // => { contents: <Buffer 00 01 00 ...> }
        setImmediate(huahua, 0);
    });
}

huahua();
