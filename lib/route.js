methods = require("methods");
var makeRoute = function(verb,handle){
  if(verb ===undefined){
    var route = function(req,res){
      var index = 0,
	  stack_temp = route.stack,
	  err;
      run_func(stack_temp[0]);
      return err;

      function run_func(func){
	var next = function(r){
	  if(r!==undefined){//error
	    index = stack_temp.length;
	    if(r!=="route"){
	      err = r;
	    }
	  }
	  else{
	    index ++;
	  }
	  run_func(stack_temp[index]);
	};
	if(func === undefined){
	  return;
	}
	makeRoute(func.verb,func.handler)(req,res,next);
      }
      
    };
    route.handle = route;
    route.stack = [];

    route.use = function(verb,handler){
      route.stack.push({verb:verb,handler:handler});
      return route;
    };
    methods.push("all");
    methods.forEach(function(method){
      route[method] = function(handler){
	route.use(method,handler);
	return route;
      };
    });

    return route;
  }
  if(handle.length == 4){
    return function(err,req,res,next){
      if(req.method == verb.toUpperCase() || verb.toUpperCase() == "ALL"){
	handle(err,req,res,next);
      }
      else{
	next(err);
      }
    };
  }
  else{
    return function(req,res,next){
      if(req.method == verb.toUpperCase() || verb.toUpperCase() == "ALL"){
	handle(req,res,next);
      }
      else{
	next();
      }
    };
  }
};
module.exports = makeRoute;
