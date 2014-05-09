var http = require('http');

module.exports = function(){
  var app = function(req,res){
    res.statusCode = 404;
    res.end();   
  };
  app.listen = function(port,callback){
    var server = http.createServer(this);
    server.listen(port,callback);
    return server;
  };

  return app;
};

