var msg=require("../../communication/marshall");

process.on('message', function(str) {
    console.log(str);
    var obj;
    obj=msg.unmarshall(str);

    if (obj.type==="init") {
        process.send(msg.marshall({
            type: "ready",
        }));
    } else {
        // TODO report the error?
    }
});
