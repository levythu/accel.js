var app = require('./app');
var http = require('http');

app.set('port', 2333);


app.listen(2333, function() {
    console.log('Express server listening on port ' + 2333);
});
