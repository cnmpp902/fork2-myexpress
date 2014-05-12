var express = require("../"),
    http = require("http"),
    expect = require("chai").expect,
    request = require("supertest");

describe("app",function() {
  describe("create http server",function() {
    // write your test here
    var app = express();
    it("should return 404 when get / ",function(done){
      request(app).get('/').expect(404,done);
    });    
  });

  describe("#listen",function() {
    // write your test here
    var app;
    before(function(done){
      app = express().listen(7000,done);
    });    
    it("should return http.Server",function(){
      // if you do not run a asyn function, do not add done!!!
      expect(app).to.be.instanceof(http.Server);
    });
    it("should return 404 with /",function(done){
      request("http://localhost:7000").get('/').expect(404,done);
    });
  });

  describe(".use",function() {
    /// your own test
    var app;
    beforeEach(function() {
      app = express();
    });

    describe("calling middleware stack",function() {
      
      // test cases
      it("Should be able to call a single middleware",function(done){// 
	var m1 =function(req,res,next){
	  res.end("hello form m1");
	};
	app.use(m1);
	request(app).get('/').expect("hello form m1",done);
      });
      
      it("Should be able to call next to go to the next middleware",function(done){
	var m1 = function(req,res,next) {
	  next();
	};	
	var m2 = function(req,res,next) {
	  res.end("hello from m2");
	};
	app.use(m1);
	app.use(m2);
	request(app).get('/').expect("hello from m2",done);
      });
      
      it("Should 404 at the end of middleware chain",function(done){
	var m1 = function(req,res,next) {
	  next();
	};
	var m2 = function(req,res,next) {
	  next();
	};
	app.use(m1);
	app.use(m2);
	request(app).get('/').expect(404,done);
      });
      
      it("Should 404 if no middleware is added",function(done){
	app.stack = [];	
	request(app).get('/').expect(404,done);
      });
      
    });
    
    describe("Implement Error Handling",function() {
      it("should return 500 for unhandled error",function(done){
	var m1 = function(req,res,next) {
	  next(new Error("boom!"));
	};
	app.use(m1);
	// => 500 - Internal Error
	request(app).get('/').expect(500,done);
      });
      
      it("should return 500 for uncaught error",function(done){
	var m1 = function(req,res,next) {
	  throw new Error("boom!");
	};
	app.use(m1);
	// => 500 - Internal Error
	request(app).get('/').expect(500,done);
      });
      
      it("should skip error handlers when next is called without an error",function(done){
	var m1 = function(req,res,next) {
	  next();
	};
	var e1 = function(err,req,res,next) {
	  // timeout
	};	
	var m2 = function(req,res,next) {
	  res.end("m2");
	};
	app.use(m1);
	app.use(e1); // should skip this. will timeout if called.
	app.use(m2);
	// => m2
	request(app).get('/').expect("m2",done);
      });

      it("should skip normal middlewares if next is called with an error",function(done){
	var m1 = function(req,res,next) {
	  next(new Error("boom!"));
	};
	var m2 = function(req,res,next) {
	  // timeout
	};
	var e1 = function(err,req,res,next) {
	  res.end("e1");
	};
	app.use(m1);
	app.use(m2); // should skip this. will timeout if called.
	app.use(e1);
	// => e1
	request(app).get('/').expect("e1",done);
      });      
    });  
  });  

  describe("Implement App embedding as middleware",function(){
    var app,subApp;
    beforeEach(function(){
      app = new express();
      subApp = new express();
    });
    it("should pass unhandled request to parent",function(done){      
      function m2(req,res,next) {
	res.end("m2");
      }      
      app.use(subApp);
      app.use(m2);
      //=> m2
      request(app).get('/').expect("m2",done);
    });
    it("should pass unhandled error to parent",function(done){
      function m1(req,res,next) {
	next("m1 error");
      }
      function e1(err,req,res,next) {
	res.end(err);
      }
      subApp.use(m1);
      app.use(subApp);
      app.use(e1);
      //=> m1 error
      request(app).get('/').expect("m1 error",done);
    });
  });
  
});

