module.exports = function(verb,handle){
  return function(req,res,next){
    if(req.method == verb.toUpperCase()){
      handle(req,res,next);
    }
    else{
      next();
    }
  };
};
