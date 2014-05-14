var Layer = function(path,middleware){
  this.handle = middleware;
  this.path = path;
  this.path_rgx = new RegExp('^'+path);
};

Layer.prototype.match = function(req_path){ 
  if(req_path.match(this.path_rgx))
    return {path:this.path};
  else return undefined;
};

module.exports = Layer;
