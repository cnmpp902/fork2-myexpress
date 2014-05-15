module.exports = function(verb,handle){
  if(handle.length == 4){
    return function(err,req,res,next){
      if(req.method == verb.toUpperCase()){
	handle(err,req,res,next);
      }
      else{
	next(err);
      }
    };
  }
  else{
    return function(req,res,next){
      if(req.method == verb.toUpperCase()){
	handle(req,res,next);
      }
      else{
	next();
      }
    };
  }
};
