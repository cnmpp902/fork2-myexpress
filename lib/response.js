var http = require("http"),
    mime = require("mime"),
    accepts = require('accepts'),
    crc32 = require('buffer-crc32');
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

proto.format = function(obj){
  var res = this,
      keys = Object.keys(obj),
      accept = accepts(res.req),
      ext = accept.type(keys);
  if(!ext.length){
    var err = new Error("Not Acceptable");
    err.statusCode = 406;
    throw err;
  }
  else{
    res.default_type(ext);
    obj[ext]();
  }
};
proto.send = function(code,data){
  var res = this,
      len = 0;
  data = data||code;
  if(typeof code == "number"){
    res.statusCode = code;
    if(arguments.length==1){
      res.end(http.STATUS_CODES[code]);
    }
  }
  if(
    (this.req.headers["if-none-match"] && 
     this.req.headers["if-none-match"] == res.getHeader('Etag') ) ||
      (this.req.headers["if-modified-since"] &&
       this.req.headers["if-modified-since"] >= res.getHeader('Last-Modified'))
  ){
    res.statusCode = 304;
  }
  if(this.req.method == "GET" && data && !res.getHeader('Etag')){
    res.setHeader('ETag','\"' + crc32.unsigned(data)+ '\"') ;
  }
  
  if(typeof data == "string"){
    res.default_type("html");
    len =Buffer.byteLength(data);
  }
  else if(data instanceof Buffer){
    res.default_type("octet-stream");
    len = data.length;
  }
  else {//(data instanceof Object);
    res.default_type("json");
    data = JSON.stringify(data);
    len =Buffer.byteLength(data);
  }      
  res.setHeader('Content-Length',len);
  res.end(data);
};


module.exports = proto;
