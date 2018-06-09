var expect = require('chai').expect
  , express = require('express')
  , proxyquire = require('proxyquire')
  , src = require('.').src
  , supertest = require('supertest');

describe('Index Route', function () {
  var request;
  
  beforeEach(function () {
    var appConfig = require(src('app-config'));
    var app = express();
    appConfig.setupRouters(app, app => {
      var route = proxyquire(src('./routes/index.js'), {});
      route(app);
    })
    request = supertest(app);
  });

describe('GET /', function () {
    it('should respond with an empty json object', function (done) {
      request
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function (res) {
          expect(res.body).to.deep.equal({});          
        })
        .end(function (err, res) {
          done(err);
        });
    });
  
  });
});
