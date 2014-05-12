var http = require('http');
module.exports = function(){  
  var app = function(req,res){
    var stack_temp = app.stack,
	index = 0,
	next_func;
    var next = function(err){
      index++;
      next_func = stack_temp[index];
      run_func(next_func,err);            
    };

    var run_func = function(func,err){      
      if(func === undefined){
	if(err){
	  res.statusCode = 500;
	  res.end("500 - Internal Error");   
	}
	else{
	  res.statusCode = 404;
	  res.end("404 - Not Found");   
	}
	return;
      }
      try{	  
	if(func.length<4 && err === undefined){	    
	  func(req,res,next);
	}
	else if(func.length == 4 && err !== undefined){
	  func(err,req,res,next);
	}
	else{
	  next(err);
	}
      }
      catch(e){
	next(e);
      }
    };
    // run 起来
    run_func(stack_temp[0],undefined);
  };
  app.stack = [];
  //console.log(app.prototype.constructor );
  app.constructor = app;
  app.use = function(func){
    if(func.stack !== undefined)
      app.stack = app.stack.concat(func.stack);
    else
      app.stack.push(func);
    return app;
  };
  app.listen = function(port,callback){
    var server = http.createServer(this);
    server.listen(port,callback);
    return server;
  };
  return app;
};

