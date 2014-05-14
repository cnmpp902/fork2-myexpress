var express = require("../"),
    Layer = require("../lib/layer"),
    http = require("http"),
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
  });
});
