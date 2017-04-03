// THIS IS JUST AN EXAMPLE, NOT A VALID JS SOURCE CODE!

// The initial message, send from master to worker once the connection is established
{
    type: "init",
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
