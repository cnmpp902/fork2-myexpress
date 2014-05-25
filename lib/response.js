var http = require("http"),
    mime = require("mime");
var proto = {};
proto.isExpress = true;
proto.__proto__ = http.ServerResponse.prototype;

proto.redirect = function(code,new_path){
  var res = this,
      isDefault = arguments.length == 1;
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
proto.type = function(ext){
  var res = this;
  res.setHeader('Content-Type',mime.lookup(ext));
};

proto.default_type = function(ext){
  var res = this;
  if(!res.getHeader('content-type')){
    res.type(ext);
  }
};

module.exports = proto;
