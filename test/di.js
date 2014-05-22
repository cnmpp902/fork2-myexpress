var express = require("../"),
    expect = require("chai").expect,
    createInjector = require("../lib/injector"),
    request = require("supertest");

describe("factory",function(){
  var app;
  before(function(){
    app = express();
  });
  it("should add a factory in _factory",function(){
    var getStatus = function(req,res,next) {
      next(null,"ok");
    };
    app.factory("status",getStatus);
    expect(app._factories["status"]).to.eql(getStatus);  
  });
  
  
});

describe("injector",function(){
  var injector;
  before(function(){
    handler = function(foo,bar,baz) {

    };
    injector = createInjector(handler);
  });
  it("should get extract params",function(){
    expect(injector.extract_params()).to.deep.equal(["foo","bar","baz"]);
  });
  
});
