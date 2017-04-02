function DisVar() {
    this.version=0;
    this.value=undefined;
}

DisVar.prototype.put=function(val) {
    this.version++;
    this.value=val;
}

DisVar.prototype.get=function() {
    // TODO maybe fetch remotely!
    return this.value;
}

module.exports=DisVar;
