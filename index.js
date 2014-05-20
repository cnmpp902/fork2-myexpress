var http = require('http'),
    makeRoute = require("./lib/route"),
    methods = require("methods"),
    layer = require("./lib/layer");
module.exports = function(){  
  
  var app = function(req,res,sub_err,sub){
    var	stack_temp = app.stack,
	index = 0,
	isSub = sub===true,
	next_layer,
	ret_err;   
      
    // run 起来
    run_func(stack_temp[0],sub_err);
    return ret_err;

    function run_func(lay,err){  
      var next = function(e){      
	index++;
	next_layer = stack_temp[index];
	run_func(next_layer,e);    
      };

      if(lay === undefined){      
	if(isSub){	
	  ret_err = err;
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

      if(m === undefined){ //not match url
	next(err);
	return;
      }
      req.params = m.params;
      
      try{	  
	var func = lay.handle,
	    url_temp;	    
	if(typeof func.handle === "function"){ // is an express obj
	  url_temp = req.url;
	  req.url = req.url.substr(m.path.length);
	  err = func(req,res,err,true);
	  req.url = url_temp;
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
  app.handle = app; 

  app.use = function(path,middleware,option){    
    var notPath = arguments.length === 1;
    app.stack.push(new layer(notPath?"/":path,notPath?path:middleware,option||false));
    return app;
  };

  
  methods.concat(["all"]).forEach(function(method){
    app[method] = function(path,middleware){
      //app.use(path,makeRoute(method,middleware),true);
      app.route(path)[method](middleware);
      return app;
    };
  });

  app.listen = function(port,callback){
    var server = http.createServer(this);
    server.listen(port,callback);
    return server;
  };
  app.route = function(path){
    var r = makeRoute();
    app.use(path,r,false);
    return r;
  };
  return app;
};
