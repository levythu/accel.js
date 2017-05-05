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

RDD.prototype.collect=function() {

};

RDD.prototype.do=function() {

};

RDD.prototype.partition=function(number) {

};

RDD.prototype.worker=function(memberList) {
    
}
