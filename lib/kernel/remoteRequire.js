// @ Force
function RemoteRequire(Pred) {
    if (Pred instanceof RemoteRequire) return Pred;
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

RemoteRequire.prototype.put=function(val) {
    throw new Error("Remote require is read-only");
}

RemoteRequire.prototype.addSource=function(src) {
    this.package=require(src);
    this.src=src;
}

// @ Force
RemoteRequire.prototype.get=function() {
    return this.package
}

// @ Force
RemoteRequire.prototype.shadow=function() {
    return {
        v: this.version,
        s: this.src,
    };
}

// @ Force
RemoteRequire.prototype.clone=function(shadow, env, key) {
    this.version=shadow.v;
    this.addSource(shadow.s);
}

module.exports=RemoteRequire;
