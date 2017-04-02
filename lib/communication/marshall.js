
// input: an object
// output: string
exports.marshall=function(obj) {
    return JSON.stringify(obj);
}

// input: string
// output: an object, or {} on error
exports.unmarshall=function(str, hint=null) {
    try {
        return JSON.parse(str);
    } catch (e) {
        return {};
    }
}
