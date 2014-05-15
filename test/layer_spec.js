var express = require("../"),
    Layer = require("../lib/layer"),
    expect = require("chai").expect,
    request = require("supertest");

describe("layer",function(){  
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
  describe("Implement Path Parameters Extraction",function(){
    var layer;
    before(function(){
      layer = new Layer("/foo/:a/:b",function(){});
    });
    it("should return undefined for match /foo",function(){
      expect(layer.match("/foo")).to.be.undefined;
    });
    it("should return undefined for match /foo/apple",function(){
      expect(layer.match("/foo/apple")).to.be.undefined;
    });
    it("should return a:apple,b:xiaomi for match /foo/apple/xiaomi",function(){
      var m = layer.match("/foo/apple/xiaomi");
      expect(m).to.have.property("path","/foo/apple/xiaomi");
      expect(m.params).to.deep.equal({a:"apple",b:"xiaomi"});
    });
    it("should return a:apple,b:xiaomi for match /foo/apple/xiaomi",function(){
      var m = layer.match("/foo/apple/xiaomi/htc");
      expect(m).to.not.be.undefined;      
      expect(m).to.have.property("path","/foo/apple/xiaomi");
      expect(m.params).to.deep.equal({a:"apple",b:"xiaomi"});
    });
  });
  describe("Implement req.params",function(){
    var app;
    before(function(){
      app = express();
      app.use("/foo/:a",function(req,res,next) {
	res.end(req.params.a);
      });
      app.use("/foo",function(req,res,next) {
	res.end(""+req.params.a);
      });
    });
    it("should return google for get /foo/google",function(done){
      request(app).get("/foo/google").expect("google",done);
    });
    it("should return undefined for get /foo",function(done){
      request(app).get("/foo").expect("undefined",done);
    });
  });
  describe("Prefix path trimming for embedded app.",function(){
    var app,subApp;
    before(function(){
      app = new express();
      subApp = new express();
      subApp.use("/bar",function(req,res) {
	res.end("embedded app: "+req.url);
      });
      subApp.use("/acc",function(req,res){
	res.end("embedded app: "+req.url);
      });
      app.use("/foo",subApp);
      app.use("/foo",function(req,res) {
	res.end("handler: "+req.url);
      });
    });
    it("should return embbeded app for get /foo/bar",function(done){
      request(app).get("/foo/bar").expect("embedded app: /bar",done);
    });
    it("should return handler app for get /foo",function(done){
      request(app).get("/foo").expect("handler: /foo",done);
    });
    it("should return embbeded app for ger /foo/acc",function(done){
      request(app).get("/foo/acc").expect("embedded app: /acc",done);
    });
  });
});
