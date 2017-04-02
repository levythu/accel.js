# Accel.js
Team members:
Leiyu Zhao(leiyuz)
Hailiang Xu(hailianx)

## Summary
We are going to make Node.js parallelized and distributed to achieve higher throughput.



## Background

In the recent 5 years, Node.js is by all means the hotspot of backend (server) programming. By introducing Chrome V8 engine with native syscall support, Javascript is not anymore a wimpy script language which can only be used to render web pages. Instead, by adopting non-blocking asynchronous I/O APIs, Node.js is always capable of keeping CPU running, and therefore achieving far higher throughput than its counterparts Python, PHP and Ruby when providing web services.

With the popularization of Node.js, it is not surprising to find waves of new packages emerging on NPM (Node Package Manager). They are useful for that they exempt the programmer from finding the package in other languages and use sophisticated way to assemble it. One good example is [fontmin](https://www.npmjs.com/package/fontmin), which minifies the size of fonts to some subset of characters to reduce the traffic to load the font and is highly prevalent for web services like Google Font. Other packages on Machine Learning, Scientific Computing, etc. are also popular.

However, using these packages to deploy a service to efficiently use computing resources is not an easy thing. Although Node.js is good at fully utilize one core, it cannot extend to multicores. In Node.js execution model, all codes are running on the single thread. Hence, simply importing those packages and use them as a part of your service has two drawbacks:

- Poor utilization of multicore CPUs. Since only one thread means at most one core.
- Node.js implements non-preemptive scheduling, and computation intensive codes will prevent the event loop from accepting any other events (like clock ticks, new requests, messages, etc.)

Solutions are using multi-process. However, not-shared memory and IPC make it hard and not intuitive. Accel.js helps make life easier: by providing intuitive interfaces, easy to use MPIs and efficient scheduling policies, Accel.js is trying to hiding the complexity beyond the reach of developers. Further, Accel.js makes it extremely easy (no efforts) to extend the service to a cluster.




## Challenge
### No shared memory multi-process model
As mentioned in the background, Node.js exposes no thread-like interfaces to developer, so the only way to utilize multiple cores are multi-process. Since they cannot share the same address space, communications among different processes are harder and may require higher overheads. How to achieve good speedup considering the overheads is a great challenge.

### How to implement graceful API for Javascript
Unlike Python, ECMAScript (Javascript) does not support many grammar tricks. Therefore, it is hard to implement intuitive and graceful API to parallelize computing. A counter-example is the builtin package for Node.js, [cluster](https://nodejs.org/api/cluster.html), which makes parallel computing almost no easier than do it from scratch.

Since our goal is to make life easier, it is very essential to address the challenge.

### Meta communication among workers (and master)
It is obvious that meta-communications exist among nodes, e.g. reporting liveness, pushing/pulling tasks, etc. and some are essentially taking place in the background. However, when the computing intensive task is blocking the event loop, Node.js cannot respond to any background communications.

The best solution to the problem is introducing Node-gyp to compile C++ codes as part of Node.js library. However, Node-gyp itself is a challenge.

### Node-gyp
For functionalities and efficiency requirements, we may need native C++ code as part of our library. Node-gyp is the solution, which allow us to write some C++ to manipulate Chrome V8 engine directly. However, learning Node-gyp is very difficult and may encounter lots of pitfalls.




## Resources
We will start from scratch to build Accel.js. Since we need to test our package in a distributed environment, a cluster of machines are needed. Also, due to the fact that we may require root privilege, Amazon AWS is an ideal platform for us. Another advantage of AWS is we can configure the cluster conveniently.




## Goals
### Minimum Goals
- Make fully use of one multi-core computer for Node.js.
- Design and implement distributed master-workers model to alleviate master workload and achieve even better performance.
- Beat an existing solution [parallel.js](https://parallel.js.org), which has 2.4k stars in Github.
### Optional Goals
- Embedding C++ code for communication between master and workers to reduce latency and achieve better load balancing.

  ​

## Platform
We plan to extend Node.js to support concurrent execution. The advantage is that program is able to respond to other jobs timely because it won’t be trapped in CPU intensive job for a long time.

Also, currently, web browser JS doesn’t support distributed and parallel execution. It’s possible to port our package to web browser JS.



## Schedule
We have approximately 5 weeks to do this project.

#### Week 1
- Design graceful API of Node.js
- Explore the overall architecture of Accel.js

#### Week 2
- Complete communication between processes

#### Week 3
- Finish parallel part to make fully use of multi-core
- Write checkpoint report

#### Week 4
- Design and implement distributed master-slave model

#### Week 5
- Conduct experiments and evaluate our implementation vs. parallel.js
- Write final report