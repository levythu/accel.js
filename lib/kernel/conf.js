// this is an example. True values are set on init.
globalConf={
    workerInfo: {  // only for worker
        type: "local",
        id: 0,
    },

    isMaster: true,

    masterEndPoint: "", // only useful for remote worker

    env: [              // defining worker pool, all the elems in the array makes the pool
        {               // a local worker def
            local: 3,   // worker number, or -1 if equal to the max local cores
        },
        {               // a remote worker def
            remote: 3,  // worker number, must >0
            endpoint: "someendpoint",
        }
    ],

    verbose: false,

    listenPort : 15618,
    localWorkerEndpoint : "127.0.0.1",
};

module.exports=globalConf;
