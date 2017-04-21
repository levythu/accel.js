// THIS IS JUST AN EXAMPLE, NOT A VALID JS SOURCE CODE!

// The initial message, send from master to worker once the connection is established
{
    type: "init",
    nodeId: 0,
    nodeType: "local/remote",
}

// Response message for initial, from worker to master
{
    type: "ready",
}

// Pulling task message, from worker to master
{
    type: "pull",
    maxtask: 4,     // optional, no limit in default
}

// Push task to worker
{
    type: "push",
    task:[
        {
            envId: 4,
            functionKey: "SomeFunction",
            stringArgList: "[A serialized string for arglist, e.g. [1, 3, 5]]",
            tag: "25",
        }
    ],
    addons: [   // optionally, required disvar
        {
            envId: 4,
            patch: {...},
        }
    ],
}

// Report result (and potentially issue another pull)
{
    type: "report",
    maxtask: 4,     // optional, or donot pull in default
    tag: "25",
    result: someResult, // not serailized version
}

// Custom Message
{
    type: "cmsg",
    uid: "whatwhat?",
    c: <anything>,
}
