var express = require("../"),
    makeRoute = require("../lib/route"),
    expect = require("chai").expect,
    request = require("supertest");

describe("route",function(){
  var app,route;
  before(function(){
    route = function(req,res,next){};
    app = express();
    app.get("/foo",function(req,res) {
      res.end("foo");
    });
  });
  it("should return function when call makeroute",function(){
    expect(makeRoute("get",route)).to.be.instanceof(Function);
  });
  it("should return foo when get /foo",function(done){
    request(app).get("/foo").expect("foo",done);
  });
  it("should return 404 when get /foo/bar",function(done){
    request(app).get("/foo/bar").expect(404,done);
  });
  it("should return 404 when post /foo",function(done){
    request(app).post("/foo").expect(404,done);
  });
});
