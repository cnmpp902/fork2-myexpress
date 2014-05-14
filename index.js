var http = require('http'),
    layer = require("./lib/layer");
module.exports = function(){  
  var app = function(req,res){
    var stack_temp = app.stack,
	index = 0,
	next_layer;
    var next = function(err){
      index++;
      next_layer = stack_temp[index];
      run_func(next_layer,err);    
    };

    var run_func = function(lay,err){      
      if(lay === undefined){
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
      if(lay.match(req.url)===undefined){
	next(err);
	return;
      }
      try{	  
	var func = lay.handle;
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
  app.constructor = app;
  app.use = function(){
    var path = "/",
	middleware = arguments[0];
    if(arguments.length>1){
      path = arguments[0];
      middleware = arguments[1];
    }
    if(middleware.stack !== undefined)// in fact it is an express obj.
      app.stack = app.stack.concat(middleware.stack);
    else
      app.stack.push(new layer(path,middleware));
    return app;
  };
  app.listen = function(port,callback){
    var server = http.createServer(this);
    server.listen(port,callback);
    return server;
  };
  return app;
};

