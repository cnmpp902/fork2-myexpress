var Layer = function(path,middleware){
  this.handle = middleware;
  this.path = function(){
    var len = path.length;
    if(len > 1 && path[len-1] == '/'){
      return path.substr(0,len-1);
    }
    else{
      return path;
    }
  }();
};

Layer.prototype.match = function(req_path){ 
  var len = this.path.length;
  if(this.path == '/' || req_path.substr(0,len) == this.path && (req_path[len] == '/' || req_path[len] === undefined)){
    return {path:this.path};
  } 
  else return undefined;
};

module.exports = Layer;
