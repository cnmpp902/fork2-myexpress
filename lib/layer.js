var p2re = require("path-to-regexp");

var Layer = function(path,middleware){
  this.handle = middleware;
  //this.path = Layer.prototype.trim(path);
  this.path = path.slice(-1) == '/'?path.slice(0,-1):path;
  this.names = [];
  this.path_rgx = p2re(this.path,this.names,{end: false});
};

/*
Layer.prototype.trim = function(path){
  if(path.slice(-1) == '/')
    return path.slice(0,-1);
  else
    return path;
};*/

Layer.prototype.match = function(req_path){ 
  var dc_path = decodeURIComponent(req_path);
  /*
  var temp_n = [];
  var temp_m;
  if(this.pre_path !== undefined && this.pre_path !== ""){
    temp_m = p2re(this.pre_path,temp_n,{end:false}).exec(dc_path);
    if(temp_m !== null){
      dc_path = dc_path.substr(temp_m[0].length);
    }
    else
      return undefined;
  }*/
  var m = this.path_rgx.exec(dc_path);
  var n = this.names;
  if(m!==null){    
    return {path:m[0],
	    params:function(){
	      var p = {};
	      var len = n.length;
	      for(var i=0; i<len; i++){
		p[n[i].name] = m[i+1];
	      }
	      return p;
	    }()
	   };
  }
  else return undefined;
};

module.exports = Layer;
