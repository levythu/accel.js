# Accel.js
Accelerate your Node.js codes on multicores and multi-nodes with no efforts!

## Quick Start

Install `accel.js`:

```shell
npm install --save accel
```

Write a program with computational intensive functions

```javascript
function cpuIntensive(n) {
    var result=0;
    for (var i=0; i<n; i++) result=Math.random();
    return result;
}

for (var i=10000; i<20000; i++) {
    var result=cpuIntensive(i);
    console.log(result);
}
```

And accelerate it on your awesome dual core machine!

```javascript
var accel=require("accel");
var $=accel();

function cpuIntensive(n) {
    var result=0;
    for (var i=0; i<n; i++) result=Math.random();
    return result;
}
$(cpuIntensive);

accel.init();
for (var i=10000; i<20000; i++) {
    $.cpuIntensive(i, (result) => {
        console.log(result);
    });
}
```

Broadcasting variables? Easy!

```javascript
var accel=require("accel");
var $=accel();

$.magicNumber1=1103515245;
$.magicNumber2=12345;
$(function generatePseudoRandom(next) {
    next = next * $.magicNumber1 + $.magicNumber2;
    return Math.floor(next/65536) % 32768;
});

accel.init();
$.generatePseudoRandom(50, (res) => {
    console.log(res);
});
```

Asynchronous function works well, too:

```javascript
var accel=require("accel");
var $=accel();

$.magicTricks=function(str) {...};
$(function readAndCalculate(callback) {
    fs.readFile('/etc/passwd', 'utf8', (err, data) => {
        callback($.magicTricks(data));
    });
}, "async");

accel.init();
$.readAndCalculate((res) => {
    console.log(res);
});
```

## Initialization

Any application using `accel.js` should initialize it **exactly once**, you can specify how many local workers (run on local CPUs) and how many remote workers (run on other machines) are in the workers pool.

You don't have to wait for the callback before using any functionalities of `accel.js`. Those who rely on the connections among workers will be deferred automatically.

### `accel.init(options, [callback])`

- `options`: specify the options for `accel.js`
  - `env` (optional): List, each element is one of the following: (default is `{local: -1}`)
    - `{local: workerCount}`: add some number of local workers in the pool, if `workerCount=-1`, it is set to the number of CPUs in local machine.
    - [Not supported yet] `{remote: workerCount, endPoint: "someEndpoint"}`: add some number of remote workers on the endpoint in the pool.
- `callback`: called when all workers are spawned, and connections are established.

##  Broadcast Scope

Broadcast scope is the center of all magic. In your code which is executed remotely, all the local variables are not accessible (of course!) and you can use broadcast scope to make them available.

`var $=accel();` will create a new broadcast scope. It is recommended to use separate scope for every .js file to achieve scope isolations. When functions in some scope are executed remotely, the scope will be synchronized automatically and incrementally to broadcast the variables.

The broadcast scope is nothing more than a js-object, just read/write values by `$.someKey=someValue` or `$["someKey"]=someValue`.

The scope can also be used as a function, in order to register worker-functions:

### Register worker-functions: `$(someFunction, [mode])`

- `someFunction`: a function that will be executed remotely. If the function has name, it can be called later by accessing the broadcast scope (`$.funcName(...)`); if the function is anonymous, it can only be called at once (`$(function(){xxx})(...)`).
- `mode` (optional): define the mode of the function, default is `"sync"`
  - `"sync"`: the function is working in a synchronous way, its result will be returned as soon as the function exit.
  - `"async"`: the function is an asynchronous one, and abide the convention that the last parameter is the callback. The result will be passed by the parameter of callback.

**Note: **

- **Synchronizing broadcast scope is not free, so reusing variables helps keeping programs fast. Anonymous function is a one-time function and will never be reused, therefore not recommended.**

- **Syncing is achieved by JSON, therefore unable to reserve prototype chain, function-in-object, etc., although function directly as value will be reserved (as shown below). To use nested objects with prototype and functions remotely please use homogeneous dependency.**

  ```javascript
  $.x1={func: function() {...}};		// func will not be reserved
  $.x2=function() {...};			  	// good to go!
  ```

  ​

### Invoke worker-functions

For synchronous function, pass all the parameters as normal, plus a trailing function as callback:

```javascript
function someFunction(arg1, arg2) {}
$(someFunction);
$.someFunction(arg1, arg2, (res) => {
    // now the function has completed
});
```

For asynchronous function, call the function as it is.

```javascript
function someAsyncFunc(arg1, arg2, callback) {}
$(someAsyncFunc, "async");
$.someAsyncFunc(arg1, arg2, (params) => {
	// now the function has completed
});
```

Besides, all the remote functions can be decorated before called:

```javascript
$.someFunction(arg1, arg2, (res) => { });	// normal invocation
$.someFunction.urgent()(arg1, arg2, (res) => { });	// urgent invocation, the task will be scheduled first
$.someFunction.to(2)(arg1, arg2, (res) => { });	// targeted invocation, the task will be assigned to node 2
$.someFunction.toAll()(arg1, arg2, (res) => { });	// cohert invocation, each node will execute this task exactly once
```

## Homogeneous Dependency

In most cases, it is required to import some packages outside in worker functions. This is achieved by introducing homogeneous dependency:

```javascript
$.os=accel.require("os");
$.localPackage=accel.require("./localPackage");

$.os.platform();		// you can invoke it locally
$(function() {
    return $.os.platform();	// or invoke it remotely
})((res) => {
    // do something
});
```

**Note: Only use it after assigning to a broadcast scope.**

`$.os=accel.require("os");` is OK, while `var os=accel.require("os");` is not ok.
