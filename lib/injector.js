var getParameters = require("./utils").getParameters;

module.exports = function(handler,app){
  var injector = function(req,res,next){
    var fn = function(err,values){
      if(err){
	next(err);
	// Did it need to deliver this next to dependencies_loader to cover dependencies_loader's next??
      }
      else{
	handler.apply(null,values);
      }
    };
    injector.dependencies_loader(req,res,next)(fn);
  };

  injector.extract_params = function(){
    return getParameters.cache[handler]?getParameters.cache[handler]:getParameters(handler);
  };

  injector.dependencies_loader = function(req,res,esc){
    var error,
	values = [],
	index = -1,
	params = injector.extract_params(),
	max = params.length,
	arg_names = ["req","res","next"],
	f = app._factories;
    
    for(var i=0;i<3;i++){
      if(arguments[i]){
	f[arg_names[i]] = arguments[i];
      }
    }

    var next = function(err,val){
      if(err){
	error = err;
      }
      if(val){
	values.push(val);
      }
      if(++index < max){
	try{
	 if(typeof f[params[index]] == "function"){ 
	   f[params[index]](req,res,next);
	 }
	 else if(f[params[index]]){
	   next(null,f[params[index]]);
	 }
	 else{
	   throw new Error("Factory not defined: "+params[index]);
	 }
	}
	catch(e){
	  //next(err);
	  error = e;
	}
      }
    };
    next();
    //app._factories[params[index]](undefined,undefined,next);
    
    return function(fn){
      fn(error,values);
    };
  };
  return injector;
};

