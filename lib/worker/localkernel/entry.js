var msg=require("../../communication/marshall");
var conf=require("../../kernel/conf");

conf.isMaster=false;

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
    } else if (obj.type==="push") {

    } else {
        // TODO report the error?
    }
});
