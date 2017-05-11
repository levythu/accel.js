var Parallel = require("paralleljs")
var getUUID=require("./randomGen");
var fs=require("fs");

var text=fs.readFileSync("res/src", {encoding:'utf8'});

var cbs={};
fs.watch("./res", {}, (eventType, filename) => {
    if (filename in cbs) {
        var cb=cbs[filename];
        delete cbs[filename];
        cb();
    }
});

module.exports=function(callback) {
    var filename=getUUID.GenerateUUID();

    var finFlag=filename+".fin";
    cbs[finFlag]=callback;

    let p = new Parallel([text, filename]);
    p.spawn(data => {
        var Fontmin = require('fontmin');
        var fs = require('fs');
        var fontmin = new Fontmin()
            .src('res/stsong.ttf')
            .use(Fontmin.glyph({
                text: data[0],
                hinting: false         // keep ttf hint info (fpgm, prep, cvt). default = true
            }))
            .dest('res/'+data[1]+".ttf");
        fontmin.run(function (err, files) {
            if (err) {
                console.error(err);
                process.exit(0);
                return "";
            }
            var finFlag='res/'+data[1]+".fin";
            fs.writeFileSync(finFlag, "");
            process.exit(0);
        });
        return "";
    }).then(data => { });
}
