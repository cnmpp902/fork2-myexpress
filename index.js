var http = require('http'),
    makeRoute = require("./lib/route"),
    methods = require("methods"),
    createInjector = require("./lib/injector"),
    layer = require("./lib/layer"),
    req_proto = require("./lib/request"),
    res_proto = require("./lib/response"),
    mime = require("mime"),
    accepts = require('accepts');
module.exports = function(){  
  
  var app = function(req,res,sub_err,sub){
    var	stack_temp = app.stack,
	index = 0,
	isSub = sub===true,
	next_layer,
	ret_err;   

    app.monkey_patch(req,res);    
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
	  res.statusCode = err.statusCode||500;
	  res.end(err.message||"500 - Internal Error");   
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
	  req.__proto__.app = app;//restore to parent
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
  app._factories = {};
  app.handle = app; 

  app.factory = function(name,fn){
    app._factories[name] = fn;
  };

  app.inject = function(fn){
    return createInjector(fn,app);
  };

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
    app.use(path,r,true);//false to true..
    return r;
  };
  
  
  app.monkey_patch = function(req,res){
    req.__proto__ = req_proto;
    res.__proto__ = res_proto;
    req.__proto__.app = app;
    req.__proto__.res = res;
    res.__proto__.req = req;
    res.__proto__.redirect = function(code,new_path){
      var isDefault = arguments.length == 1;
      if(isDefault){
	new_path = code;
	code = 302;
      }
      res.writeHead(code,{
	'Content-Length':0,
	'Location':new_path
      });      
      res.end();
    };
    res.__proto__.type = function(ext){
      res.setHeader('Content-Type',mime.lookup(ext));
    };
    res.__proto__.default_type = function(ext){
      if(!res.getHeader('content-type')){
	res.__proto__.type(ext);
      }
    };
    res.__proto__.format = function(obj){
      var keys = Object.keys(obj),
	  accept = accepts(req),
	  ext = accept.type(keys);
      if(!ext.length){
	var err = new Error("Not Acceptable");
	err.statusCode = 406;
	throw err;
      }
      else{
	res.__proto__.default_type(ext);
	obj[ext]();
      }
    };
  };

  return app;
};
