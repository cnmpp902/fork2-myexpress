var http = require("http"),
    mime = require("mime"),
    accepts = require('accepts'),
    crc32 = require('buffer-crc32'),
    fs = require("fs"),
    rparser = require("range-parser");
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

proto.stream = function(stream){
  var res = this;
  stream.on("data",function(chunk){    
    res.write(chunk);
  });
  stream.on("end",function(){
    res.end();
  });
};

proto.sendfile = function(data,option){
  var res = this,
      root = option?option.root:"",
      fileName = root.concat(data),
      range = res.req.headers.range,
      rparser_result,
      file;
  fs.stat(fileName,function(err,stats){
    if(err){
      if(err.path[err.path.indexOf('.')+1] == '.'){
	res.statusCode = 403;
      }
      else{
	res.statusCode = 404;
      }
      res.end();
    }
    else if(stats.isDirectory()){
      res.statusCode = 403;
      res.end();
    }
    else{
      res.default_type(fileName.split('.')[1]);//||plain  
      res.setHeader('Content-Length',stats.size);
      res.setHeader('Accept-Range','bytes');
      if(range){
	rparser_result = rparser(stats.size,range);	
	if(typeof rparser_result[0] == "object"  && rparser_result.type == "bytes"){
	  res.statusCode = 206;
	  res.setHeader('Content-Range',
			range.replace('=',' ')+"/"+stats.size);
	  file = fs.createReadStream(fileName,rparser_result[0]);
	  res.stream(file);
	  return;
	}
	else if(rparser_result == -1){
	  res.statusCode = 416;
	  res.end();
	  return;
	}
      }
      res.statusCode = 200;
      file = fs.createReadStream(fileName);
      res.stream(file);            
      return;
    }
  });
  
};

module.exports = proto;
