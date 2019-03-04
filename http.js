var http = require('http');

var server = http.createServer((req, res) => {
    if(req.url == '/') {
        res.write('Welcome to home page');
    }
    if(req.url == '/getEmpList'){
        res.write('List employee');
    }
    res.end();
});

server.listen(8000);