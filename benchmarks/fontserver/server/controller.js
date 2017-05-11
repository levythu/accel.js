var express = require('express');
var router = express.Router();

var cache={};

router.get('/', function(req, res) {
    res.send("Test Font Service");
});

var serialKernel=require("./kernel.serial");
router.get("/s", (req, res) => {
    if (req.query.text==null) req.query.text="default";
    if (req.query.text in cache) {
        res.send(cache[req.query.text]);
        return;
    }
    serialKernel((r) => {
        cache[req.query.text]=r;
        res.send(cache[req.query.text]);
        return;
    });
});

var accelKernel=require("./kernel.accel");
router.get("/a", (req, res) => {
    if (req.query.text==null) req.query.text="default";
    if (req.query.text in cache) {
        res.send(cache[req.query.text]);
        return;
    }
    accelKernel((r) => {
        cache[req.query.text]=r;
        res.send(cache[req.query.text]);
        return;
    });
});

var parallelKernel=require("./kernel.parallel");
router.get("/p", (req, res) => {
    if (req.query.text==null) req.query.text="default";
    if (req.query.text in cache) {
        res.send(cache[req.query.text]);
        return;
    }
    parallelKernel((r) => {
        cache[req.query.text]=r;
        res.send(cache[req.query.text]);
        return;
    });
});

module.exports=router;
