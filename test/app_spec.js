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
});




