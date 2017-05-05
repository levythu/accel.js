// RDD is a spark-like interface for data parallel.
// It is used to

// TODO: not finished yet

function RDD(funcToCreateEnv, data) {
    var getres={};
    funcToCreateEnv(getres);
    this.env=getres.res;
    this.data=data;
}

RDD.prototype.map=function(transformer) {

};
