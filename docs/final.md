# Accel.js
Leiyu Zhao(leiyuz), Hailiang Xu(hailianx)

## Summary
Accelerating your Node.js program by parallelizing computation with multi-cores and multi-nodes.


## Background
According to the Stackoverflow 2016 developer survey[1], javascript is the most popular technology in computer science. However, due to the native features of javascript, it's not a resident in the parallel programming world! Javascript adopts event-based, non-preemptive model running on a single thread. There is a main event loop that waits for events and calls the corresponding event handlers. Although the event handlers are independent control flows, they run on a single thread in a non-preemptive way, which means the functions won't give out the control unless it returns. Therefore, a CPU intensive job will block all other events. This is the motivation of Accel.js.

### Challenge
#### No shared memory multi-process model
As mentioned in the background, Node.js exposes no thread-like interfaces to developer, so the only way to utilize multiple cores are multi-process. Since they cannot share the same address space, communications among different processes are harder and may require higher overheads. How to achieve good speedup considering the overheads is a great challenge. And we need to compress the overhead as much as possible.

#### How to implement graceful API for Javascript
Unlike Python, ECMAScript (Javascript) does not support many grammar tricks (e.g. function decorator and operator overloading). Therefore, it is hard to implement intuitive and graceful API to parallelize computing. A counter-example is the builtin package for Node.js, [cluster](https://nodejs.org/api/cluster.html), which makes parallel computing almost no easier than do it from scratch.

Since our goal is to make life easier, it is very essential to address the challenge.



## Approach
Instead of implementing customized JIT interpreter, we implement Accel.js APIs as a library, which is released on [NPM](https://www.npmjs.com/package/accel). The detailed implementation (components protocols & APIs) is as follows:
### Architecture
![](img/-1.png)



This is the overall architecture of our library. As in this graph, the master will launch workers in local CPU cores. It can also contact remote daemon to create remote workers. Each working is mapping to a CPU core. During the execution of master, it can push CPU intensive jobs to a centralized job queue. The workers will offload the computation from master to prevent long-time blocking. 

### Protocols
#### 2-Phase Connect Protocol
The 2-Phase Connect Protocol(2PC) is used to create communication channels between master and workers as well as workers and workers (full connection). Each communication channel is implemented in a TCP socket.
In fact, local workers can use native pipe instead of socket. However, we conducted several experiments. And the results show that there is abnormal long latency. We don’t really know the implementation of Node.js. But similar issue is in online community as well. As a result, we adopt socket for local worker as well as remote worker. The code can be reused as well.

##### Phase 1
![](img/2.png)



The master will connect to every worker in this node and maintain a list of (id, port) pair. This data structure will be broadcasted in phase 2 to create full connection between workers. Note here the connect process is slightly different for remote worker. The master will first contact remote daemon. Remote daemon is responsible to launch remote workers. 

##### Phase 2
![](img/1.png)



After phase 1, the master knows the listening port for every worker. It will broadcast it to every worker. The worker will initialize connection to every other worker. After the full connection created, every worker will reply with a “fully connected” message. When master receives all ACK, 2PC ends.

#### Task Pulling Protocol
![](img/0.png)

How do workers get task? There is a centralized job queue. During the execution, the master will push CPU intensive jobs. Workers will pull tasks from the job queue. After execution, it will return the results and start a new round. We optimized the process by merging report of the last round and pull in the new round messages into one single message to reduce overhead.

#### CMsg Protocol

CMsg (stands for Customized Message) is implemented for communication between extended distributed data structure (e.g. Channel, incoming RDD, etc.). It is built on communication socket and for each node, there’s a CMsgRouter for sending, receiving and routing CMsg.

Extended distributed data structure registers itself on CMsgRouter on creation, and then it will be able to receive CMsg from its peers in other workers (or master).

This design fully decouples data structures from the communication layer, making it extremely easy for future extension.

### API List
*Refer to [Accel.js Documentation](https://levythu.github.io/accel.js/docs.html) for detailed API*
#### `acceljs`
The binary installed by npm to launch your application in replace of Nodejs (e.g. `npm yourApp.js`). You can specify the number of local workers as well as remote workers (you need to specify the endpoint of daemon for remote workers) that run the app. For more detail check out `acceljs --help`.

#### `accel-daemon`
The binary installed by npm to launch a remote daemon at one machine on some endpoint. Check out `accel-deamon --help` for more details.

#### Synchronization Scope
Synchronization scope is the center of all magic. In your code which is executed remotely, all the local variables are not accessible (of course!) and you can use synchronization scope to make them available transparently.

`var $=accel();` will create a new synchronization scope. It is recommended to use separate scope for every .js file to achieve scope isolations. When functions in some scope are executed remotely, the scope will be synchronized automatically to broadcast the variables. It’s noteworthy that the scope is synchronized incrementally, which means that it will not require any more traffic once it is transferred.

The broadcast scope is nothing more than a js-object, just read/write values by `$.someKey=someValue` or `$["someKey"]=someValue`.

The scope can also be used as a function, in order to register worker-functions:

##### Register worker-functions: `$(someFunction, [mode])`
- `someFunction`: a function that will be executed remotely. If the function has name, it can be called later by accessing the synchronization scope (`$.funcName(...)`); if the function is anonymous, it can only be called at once (`$(function(){xxx})(...)`).
- `mode` (optional): define the mode of the function, default is "sync"
- "sync": the function is working in a synchronous way, its result will be returned as soon as the function exit.
- "async": the function is an asynchronous one, and abide the convention that the last parameter is the callback. The result will be passed by the parameter of callback.

#### Invoke the worker-functions
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

#### Homogeneous Dependency

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

#### Channel

Accel.js also has wonderful support for MPI jobs. After launched, the workers talk to each other by channel.

### Broadcast Channel
Broadcast Channel is a [Golang style](https://tour.golang.org/concurrency/2) multi-consumer-multi-producer channel that is accessible by all the workers as well as master. Everyone can act as a producer and a consumer, i.e., send to the channel or receive from the channel. The receiving function will not callback before anything is received, while the sending function will not callback when the buffer is full.

Use the simple API to create a broadcast channel:

```javascript
$.c=new accel.Channel([bufferSize]);
```

Where the parameter is the size of channel, which by default is 0.

### Unicast Channel

Unicast Channel has the same API as broadcast channel (see below), but only support the communication between two which are specified in creation. Since unicast channel utilize direct IPC between workers instead of being controlled by master, it has lower latency.

Use similar API to create a unicast channel:

```javascript
$.c=new accel.Channel(participant1, participant2[, bufferSize]);
```

In which participant is the number of workers, or -1 for master.


## Results

*All the evaluations are performed on Amazon EC2 c4.xlarge, which has 4 vCPUs and 7.5GB of memory.*

### CPU Intensive Task: Rendering Mandelbrot Graph
We render large Mandelbrot graph (26000x6000) using either serial Node.js or divide the graph horizontally into subtasks and dispensing the subtasks to different cores using either Accel.js or Parallel.js. For each task, we glean the time spent on computation as well as framework itself (communication, framework code, etc.) and the result is as follows:

![](img/x.png)

- Accel-k denotes the performance of Accel.js on k distributed machines. And the speedup is almost linear (Accel-1 to Serial, Accel-4 to Accel-1), which shows that Accel.js achieves good utility of all the cores involved.
- Parallel.js takes much longer time due to too much framework overhead (checkout reason below.)
- Due to all-to-all communication nature of Accel.js, when there’re lots of machines, the framework overhead may be exaggerated by straggler. Also, the scalability of problem (arithmetics-communication ratio, i.e., image width) itself may prevent application from scaling further.

![图片2](img/y.png)

- Accel-1-k/Parallel.js-k denotes the execution time on one machines when the task is divided into k subtasks.
- When k is small (k=4), computation time is long due to several load imbalance.
- When k is large, Parallel.js introduces too much overhead because it seldom reuses workers for subtasks and chrome V8 VM launching overhead is not ignorable for many subtasks.

#### Hybrid Task: Google Font Subsetting Service

Google Font Subsetting Service receives a URL from requesters -> crawls the URL -> reads some large font file (10s of MB) from disks -> setups index in the memory -> subsets the font -> output the font to the disks -> serve the static file to requester. One part of the requesting is disk I/O bounded and the other is CPU bounded. We run the web server on single machines using original Node.js, Parallel.js and Accel.js to measure the throughput and response time:

![图片1](img/z.png)

![图片2](img/w.png)

- Both Accel.js and Parallel.js achieves 2x better performance in resp. time and throughput. Since part of the task is Disk I/O bounded, the application cannot achieve wonderful 4x speedup.
- Accel.js outperforms Parallel.js because Accel.js has optimized data communication socket, and delta synchronization so that the functions and data will not be transferred twice.
- Accel.js is capable of scaling further on distributed environment since there’s no disk contention on different machines. In this scenario, Accel.js master is some-kind like a load balancer in cluster.

We also introduces some possibility to issue *Cache Hit Request*, which requests generated subsetted fonts and is served just a static file. The response time of Cache Hit Request is as follows:

![图片3](img/p.png)

- Cache Hit Request is expected to be served in almost no time.
- Serial server takes very long to serve it because the event loop is blocked by other computing requests and cannot serve any request.


## LIST OF WORK BY EACH STUDENT
Equal work was performed by both project members.


## REFERENCE
- [Stackoverflow 2016 developer survey](https://insights.stackoverflow.com/survey/2016)
- [Node.js documentation](https://nodejs.org/api/modules.html) 
- [Parallel.js](https://parallel.js.org/)
- [Accel.js](https://github.com/levythu/accel.js)
