function fc(callback) {
    if (text==null) text=fs.readFileSync("res/src", {encoding:'utf8'});
    var filename=getUUID.GenerateUUID();
    var fontmin = new Fontmin()
        .src('res/stsong.ttf')
        .use(Fontmin.glyph({
            text: text,
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
}
