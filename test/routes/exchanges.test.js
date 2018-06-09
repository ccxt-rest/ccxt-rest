var expect = require('chai').expect
  , express = require('express')
  , proxyquire = require('proxyquire')
  , sinon = require('sinon')
  , src = require('.').src
  , supertest = require('supertest');

describe('Exchange Route', function () {
  var stubbedCcxt, stubbedDb, request;
  
  beforeEach(function () {
    stubbedCcxt = sinon.stub();
    stubbedDb = sinon.stub();

    var appConfig = require(src('app-config'));
    var app = express();
    appConfig.setupRouters(app, app => {
      var route = proxyquire(src('./routes/exchanges.js'), {
        ccxt : stubbedCcxt,
        './../db' : stubbedDb
      });
      route(app);
    });
    request = supertest(app);
  });

  describe('GET /exchanges', function () {
    it('should respond with list of exchanges', function (done) {
      var dummyListOfExchanges = [
        'my', 'dummy', 'list', 'of', 'exchanges'
      ];
      stubbedCcxt.exchanges = dummyListOfExchanges;
      
      request
        .get('/exchanges')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function (res) {
          expect(res.body).to.deep.equal(dummyListOfExchanges);
        })
        .end(function (err, res) {
          done(err);
        });
    });
  });

  describe('GET /exchanges/:exchangeName', function () {
    var dummyListOfExchangeIds = [
      'my', 'dummy', 'list', 'of', 'exchange', 'ids'
    ];
    it('Should return list of exchange ids', function (done) {
      stubbedDb.getExchangeIds = sinon.fake.returns(dummyListOfExchangeIds);
      request
        .get('/exchanges/bitso')
        .expect('Content-Type', /json/)
        .expect(200, function (err, res) {
          expect(res.body).to.deep.equal(dummyListOfExchangeIds);
          done();
      });
    });
  });

  describe('POST /exchanges/:exchangeName', function () {
    it('Given no error', function (done) {
      var exchangeProperties = {'id':'myId', 'apikey':'myApiKey', 'secret':'mySecret'};
      request
        .post('/exchanges/bitso')
        .send(exchangeProperties)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect(function (res) {
          expect(res.body).to.include(exchangeProperties);
        })
        .end(function (err, res) {
          done(err);
        });
    });
    
    it('Given error', function (done) {
      var error = new Error ('This error is always thrown for testing purposes');
      stubbedCcxt.bitso = sinon.fake.throws(error);
      
      request
        .post('/exchanges/bitso')
        .send({})
        .expect('Content-Type', /json/)
        .expect(500)
        .expect(function (res) {
          expect(res.body).to.deep.equal({
            error: {},
            message : error.message
          });
        })
        .end(function(err, res) {
          done(err);
        });
    });
  });

  describe('GET /exchanges/:exchangeName/:exchangeId', function () {
    it('Given exchange does NOT exist', function (done) {
      stubbedDb.getExchange = sinon.fake.returns(null);
      request
        .get('/exchanges/bitso/unknownId')
        .expect(404)
        .end(function(err, res) {
          done(err);
        });
    });

    it('Given exchange exists', function (done) {
      var knownExchange = {
        id : 'dummyId',
        appKey : 'dummyKey',
        secret : 'dummySecret'
      };
      stubbedDb.getExchange = sinon.fake.returns(knownExchange);
      request
        .get('/exchanges/bitso/dummyId')
        .expect(200)
        .expect(function(res) {
          expect(res.body).to.deep.equal(knownExchange);
        })
        .end(function(err, res) {
          done(err);
        });
    });
  });

  describe('DELETE /exchanges/:exchangeName/:exchangeId', function () {
    it('Given exchange does NOT exist', function (done) {
      stubbedDb.deleteExchange = sinon.fake.returns(null);
      request
        .delete('/exchanges/bitso/unknownId')
        .expect(404)
        .end(function(err, res) {
          done(err);
        });
    });

    it('Given exchange exists', function (done) {
      var knownExchange = {
        id : 'dummyId',
        appKey : 'dummyKey',
        secret : 'dummySecret'
      };
      stubbedDb.deleteExchange = sinon.fake.returns(knownExchange);
      request
        .delete('/exchanges/bitso/dummyId')
        .expect(200)
        .expect(function(res) {
          expect(res.body).to.deep.equal(knownExchange);
        })
        .end(function(err, res) {
          done(err);
        });
    });
  });

  describe('POST /exchanges/:exchangeName/:exchangeId/:methodName', function () {
    it('Given exchange does NOT exist', function (done) {
      var methodParameters = ['BTC/MXN'];
      stubbedDb.getExchange = sinon.fake.returns(null);
      request
        .post('/exchanges/bitso/dummyId/fetchTicker')
        .send(methodParameters)
        .expect(404)
        .end(function(err, res) {
          done(err);
        });
    });

    it('Given exchange exists', function (done) {
      var methodParameters = ['BTC/MXN'];
      var dummyTickerResponse = {
        "symbol":"BTC/MXN",
        "timestamp":1528577665000,
        "datetime":"2018-06-09T20:54:25.000Z",
        "high":153900,
        "low":152200.48,
        "bid":152300,
        "ask":153260.66,
        "vwap":152022.67046666,
        "close":153260.66,
        "last":153260.66,
        "baseVolume":46.08971284,
        "quoteVolume":7006681.226978308,
        "info":{
          "high":"153900.00",
          "last":"153260.66",
          "created_at":"2018-06-09T20:54:25+00:00",
          "book":"btc_mxn","volume":"46.08971284",
          "vwap":"152022.67046666",
          "low":"152200.48",
          "ask":"153260.66",
          "bid":"152300.00"
        }
      };
      var knownExchange = {
        id : 'dummyId',
        appKey : 'dummyKey',
        secret : 'dummySecret',
        fetchTicker : function() {
          return dummyTickerResponse;
        }
      };
      stubbedDb.getExchange = sinon.fake.returns(knownExchange);
      request
        .post('/exchanges/bitso/dummyId/fetchTicker')
        .send(methodParameters)
        .expect(200)
        .expect(function(res) {
          expect(res.body).to.deep.equal(dummyTickerResponse);
        })
        .end(function(err, res) {
          done(err);
        });
    });
  });
});
