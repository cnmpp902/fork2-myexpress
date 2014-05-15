var http = require('http'),
    layer = require("./lib/layer");
module.exports = function(){  
  var app = function(req,res){
    var	stacks = [{stack:app.stack,index:0,url:req.url}],
	next_layer,
	current_stack = function(){return stacks[stacks.length-1];};

    var next = function(err){
      var c = current_stack();
      c.index++;
      next_layer = c.stack[c.index];
      run_func(next_layer,err);    
    };
    
    // run 起来
    run_func(current_stack().stack[0],undefined);

    function run_func(lay,err){      
      if(lay === undefined){
	if(stacks.length >1 ){ 
	  stacks.pop();
	  req.url = current_stack().url;
	  next(err);
	}
	else if(err){
	  res.statusCode = 500;
	  res.end("500 - Internal Error");   
	}
	else{
	  res.statusCode = 404;
	  res.end("404 - Not Found");   
	}
	return;
      }
      var m = lay.match(req.url);
      if(m === undefined){
	next(err);
	return;
      }
      req.params = m.params;
      
      try{	  
	var func = lay.handle;
	if(typeof func.handle === "function"){ // is an express obj
	  req.url = req.url.substr(m.path.length);
	  stacks.push({stack:func.handle.stack,index:-1,url:req.url});	  
	  next(err);
	}
	else if(func.length<4 && err === undefined){	    
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
    }
  };

  app.stack = [];
  app.constructor = app.handle = app;

  app.use = function(){
    var path = "/",
	middleware = arguments[0];
    if(arguments.length>1){
      path = arguments[0];
      middleware = arguments[1];
    }
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
