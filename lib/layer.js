var p2re = require("path-to-regexp");

var Layer = function(path,middleware){
  this.handle = middleware;
  this.path = path.slice(-1) == '/'?path.slice(0,-1):path;
  this.names = [];
  this.path_rgx = p2re(this.path,this.names,{end: false});
};

Layer.prototype.match = function(req_path){ 
  var dc_path = decodeURIComponent(req_path);
  var m = this.path_rgx.exec(dc_path);
  var n = this.names;
  if(m!==null){    
    return {path:m[0],
	    params:function(){
	      var p = {};
	      for(var i=0, len = n.length; i<len; i++){
		p[n[i].name] = m[i+1];
	      }
	      return p;
	    }()
	   };
  }
  else return undefined;
};

module.exports = Layer;
