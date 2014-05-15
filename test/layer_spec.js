var express = require("../"),
    Layer = require("../lib/layer"),
    expect = require("chai").expect,
    request = require("supertest");

describe("layer",function(){
  describe("Layer class and the match method",function(){
    var layer,
	middleware;
    before(function(){
      middleware = function(req,res){
	res.end("foo!");
      };
      layer = new Layer("foo",middleware);    
    });
  });
  
  describe("app.use should add a Layer to stack",function(){
  });
  
  describe("The middlewares called should match request path:",function(){
    var app;
    before(function(){
      app = express();
      app.use("/foo",function(req,res,next){
	res.end("foo");
      });
      app.use(function(req,res,next){
	res.end("root");
      });
    });
    it("should return root for get /",function(done){
      request(app).get('/').expect("root",done);
    });
    it("should return foo for get /foo",function(done){
      request(app).get('/foo').expect("foo",done);      
    });
    it("should return foo for get /foo/",function(done){
      request(app).get('/foo/').expect("foo",done);
    });
    it("should return /foo for get /foo/bar",function(done){
      request(app).get('/foo/bar').expect("foo",done);
    });
    it("should return 404 for get /foodd",function(done){
      request(app).get('/foodd').expect("root",done);
    });
  });
});










