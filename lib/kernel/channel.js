// @ Force
function Channel(Pred) {
    if (Pred instanceof Channel) return Pred;
    // @ Force
    this.version=0;
    // @ Force
    this.__isDis=true;
    if (Pred!=null && "version" in Pred)
        this.version=Pred.version;
    this.value=undefined;
    this.src="notEverExist";
    this.package=null;
}

Channel.prototype.put=function(val) {
    throw new Error("Remote require is read-only");
}

// @ Force
Channel.prototype.get=function() {
    return this.package
}

// @ Force
Channel.prototype.shadow=function() {
    // TODO
}

// @ Force
Channel.prototype.clone=function(shadow, env, key) {
    // TODO
}

module.exports=Channel;
