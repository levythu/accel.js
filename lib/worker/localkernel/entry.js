var msg=require("../../communication/marshall");

console.log("Hey");
process.on('message', function(str) {
    console.log(str);
    var obj;
    obj=msg.unmarshall(str);

    if (obj.type==="init") {
        process.send(msg.marshall({
            type: "ready",
        }));
        process.send(msg.marshall({
            type: "pull",
            maxtask: 1,
        }));
    } else {
        // TODO report the error?
    }
});
