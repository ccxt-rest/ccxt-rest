var ccxt = require('ccxt');
var expect = require('chai').expect;
var should = require('should');
var request = require('supertest');
var fs = require('fs')

process.env.PORT = 0

var ccxtServer = require('../../../app')
var db = require('../../../api/models');
var jwtHelper = require('../../../api/helpers/jwt-helper')

var ccxtRestTestExchangeDetails = process.env.CCXTREST_TEST_EXCHANGEDETAILS
var exchangeDetailsMap = JSON.parse(ccxtRestTestExchangeDetails)

const TIMEOUT_MS = process.env.TIMEOUT_MS || 10000
const SKIPPED_EXCHANGES = JSON.parse(process.env.SKIPPED_EXCHANGES || '[]')

console.info('Test Configuration: ')
console.info({TIMEOUT_MS:TIMEOUT_MS, SKIPPED_EXCHANGES:SKIPPED_EXCHANGES})

describe('> controllers', function() {
    var server = server
    before(function() {
      if (fs.existsSync('./out/database.sqlite3')) {
        fs.unlinkSync('./out/database.sqlite3')
      }
      return new Promise((resolve) => {
        ccxtServer.start(_server => {
          server = _server
          resolve();
        })  
      })
    })

    after(function() {
      if (server) {
        server.close()
      }
      if (fs.existsSync('./out/database.sqlite3')) {
        fs.unlinkSync('./out/database.sqlite3')
      }
    })

    describe('> exchanges', function() {

    describe('> GET /exchanges', function() {

      it('> should return list of exchanges', function(done) {

        request(server)
          .get('/exchanges')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
            should.not.exist(err);

            res.body.should.eql(ccxt.exchanges.map(i => '' + i));

            done();
          });
      });

    });

  });

  describe('> exchange', function() {

    describe('> Given unsupported exchange name', function() {
      describe('> [Unsupported Exchange name] Exchange Management API', function() {
        it('> GET:/exchange/nonExistentExchangeName then return 404', function(done) {  
          request(server)
            .get('/exchange/nonExistentExchangeName')
            .expect(404)
            .end((err, res) => {
              should.not.exist(err);
              done();
            })
        });
  
        it('> POST:/exchange/nonExistentExchangeName then return 404', function(done) {  
          request(server)
            .post('/exchange/nonExistentExchangeName')
            .send({id:'nonExistentExchangeName1'})
            .set('Accept', 'application/json')
            .expect(404)
            .end((err, res) => {
              should.not.exist(err);
              done();
            })
        });
  
      })

      describe('> [Unsupported Exchange Name] Public Data API', function() {
        it('> GET:/exchange/nonExistentExchangeName/markets then return 404', function(done) {

          request(server)
              .get('/exchange/nonExistentExchangeName/markets')
              .expect('Content-Type', /json/)
              .expect(404)
              .end((err, res) => {
                should.not.exist(err);
                done();
              })
        });

        it('> GET:/exchange/nonExistentExchangeName/orderBook then return 404', function(done) {
          this.timeout(TIMEOUT_MS);
          request(server)
              .get('/exchange/nonExistentExchangeName/orderBook')
              .query({ symbol: 'BTC/ETH' })
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(404)
              .end((err, res) => {
                should.not.exist(err);
                done();
              })
        })

        it('> GET:/exchange/nonExistentExchangeName/l2OrderBook then return 404', function(done) {
          this.timeout(TIMEOUT_MS);
          request(server)
              .get('/exchange/nonExistentExchangeName/l2OrderBook')
              .query({ symbol: 'BTC/ETH' })
              .expect('Content-Type', /json/)
              .expect(404)
              .end((err, res) => {
                should.not.exist(err);
                done();
              })
        })

        it('> GET:/exchange/nonExistentExchangeName/trades then return 404', function(done) {
          this.timeout(TIMEOUT_MS)
          request(server)
              .get('/exchange/nonExistentExchangeName/trades')
              .query({ symbol: 'BTC/ETH' })
              .expect('Content-Type', /json/)
              .expect(404)
              .end((err, res) => {
                should.not.exist(err);
                done();
              })
        })

        it('> GET:/exchange/nonExistentExchangeName/ticker then return 404', function(done) {
          this.timeout(TIMEOUT_MS)
          request(server)
              .get('/exchange/nonExistentExchangeName/ticker')
              .query({ symbol: 'BTC/ETH' })
              .expect('Content-Type', /json/)
              .expect(404)
              .end((err, res) => {
                should.not.exist(err);
                done();
              })
        })

        it('> GET:/exchange/nonExistentExchangeName/tickers then return 404', function(done) {
          this.timeout(TIMEOUT_MS)
          request(server)
              .get('/exchange/nonExistentExchangeName/tickers')
              .expect('Content-Type', /json/)
              .expect(404)
              .end((err, res) => {
                should.not.exist(err);
                done();
              })
        })

        it('> POST:/exchange/nonExistentExchangeName/_/loadMarkets then return 404', function(done) {
          this.timeout(TIMEOUT_MS)
          request(server)
              .post('/exchange/nonExistentExchangeName/_/loadMarkets')
              .type('text')
              .send(JSON.stringify([true]))
              .set('Accept', 'application/json')
              .expect(404)
              .end((err, res) => {
                should.not.exist(err);
                done();
              })
        })
      });

      describe('> [Unsupported Exchange Name] Private Data APIs', function() {
        it('> GET:/exchange/nonExistentExchangeName/balances then return 404', function(done) {
          this.timeout(TIMEOUT_MS)
          request(server)
              .get('/exchange/nonExistentExchangeName/balances')
              .expect('Content-Type', /json/)
              .expect(404)
              .end((err, res) => {
                should.not.exist(err);
                done();
              })
        });

        it('> [Unsupported Exchange Name] Place order then return 404', function(done) {
          request(server)
            .post('/exchange/nonExistentExchangeName/order')
            .send({ symbol: 'BTC/ETH', type: 'limit', side: 'buy', amount:0, price:0 })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
            .end((err, res) => {
              should.not.exist(err);
              done();
            })
        })

        it('> [Unsupported Exchange Name] Cancel order then return 404', function(done) {
          request(server)
            .delete('/exchange/nonExistentExchangeName/order/dummy')
            .query({symbol : 'BTC/ETH'})
            .expect('Content-Type', /json/)
            .expect(404)
            .end((err, res) => {
              should.not.exist(err);
              done();
            })
        })

        it('> [Unsupported Exchange Name] Get order then return 404', function(done) {
          this.timeout(TIMEOUT_MS)
          request(server)
            .get('/exchange/nonExistentExchangeName/order/dummy')
            .query({symbol : 'BTC/ETH'})
            .expect('Content-Type', /json/)
            .expect(404)
            .end((err, res) => {
              should.not.exist(err);
              done();
            })
        })

        it('> [Unsupported Exchange Name] Get orders then return 404', function(done) {
          this.timeout(TIMEOUT_MS)
          request(server)
            .get('/exchange/nonExistentExchangeName/orders')
            .query({symbol : 'BTC/ETH'})
            .expect('Content-Type', /json/)
            .expect(404)
            .end((err, res) => {
              should.not.exist(err);
              done();
            })
        })

        it('> [Unsupported Exchange Name] Get open orders then return 404', function(done) {
          this.timeout(TIMEOUT_MS)
          request(server)
            .get('/exchange/nonExistentExchangeName/orders/open')
            .query({symbol : 'BTC/ETH'})
            .expect('Content-Type', /json/)
            .expect(404)
            .end((err, res) => {
              should.not.exist(err);
              done();
            })
        })

        it('> [Unsupported Exchange Name] Get closed orders then return 404', function(done) {
          this.timeout(TIMEOUT_MS)
          request(server)
            .get('/exchange/nonExistentExchangeName/orders/closed')
            .query({symbol : 'BTC/ETH'})
            .expect('Content-Type', /json/)
            .expect(404)
            .end((err, res) => {
              should.not.exist(err);
              done();
            })
        })

        it('> [Unsupported Exchange Name] Get my trades then return 404', function(done) {
          this.timeout(TIMEOUT_MS)
          request(server)
            .get('/exchange/nonExistentExchangeName/trades/mine')
            .query({symbol : 'BTC/ETH'})
            .expect('Content-Type', /json/)
            .expect(404)
            .end((err, res) => {
              should.not.exist(err);
              done();
            })
        })

      });
    });

    describe('> Given broken exchanges', function() {
      ['allcoin'].forEach(function(exchangeName) {
        it(`> [${exchangeName}] When trying to instantiate, then 503`, function(done) {
          request(server)
            .post('/exchange/' + exchangeName)
            .send({id:exchangeName})
            .set('Accept', 'application/json')
            .expect(503, done);
        })
      })
    });

    ccxt.exchanges
        .filter(exchangeName => exchangeDetailsMap[exchangeName])
        .map(exchangeName => {
      var exchangeDetails = exchangeDetailsMap[exchangeName] || {};
      exchangeDetails.exchangeName = exchangeName;
      exchangeDetails.exchangeId = exchangeDetails.creds ? exchangeDetails.creds.id : (exchangeName + new Date().getTime());

      const exchange = new ccxt[exchangeName]()

      exchangeDetails.expectedStatusCodes = {};
      exchangeDetails.expectedStatusCodes['fetchClosedOrders'] = exchange.has.fetchClosedOrders ? 200 : 501;
      exchangeDetails.expectedStatusCodes['fetchOrders'] = exchange.has.fetchOrders ? 200 : 501;
      exchangeDetails.expectedStatusCodes['fetchMyTrades'] = exchange.has.fetchMyTrades ? 200 : 501;
      exchangeDetails.expectedStatusCodes['fetchTicker'] = exchange.has.fetchTicker ? 200 : 501;
      exchangeDetails.expectedStatusCodes['fetchTickers'] = exchange.has.fetchTickers ? 200 : 501;
      
      return exchangeDetails
    }).forEach((_ctx) => {
      describe(`> [${_ctx.exchangeName}]`, function() {

        before(function() {
          if (SKIPPED_EXCHANGES.includes(_ctx.exchangeName)) {
            this.skip()
          }
        })

        describe(`> [${_ctx.exchangeName}] Given no saved exchanges`, function() {
          describe(`> [${_ctx.exchangeName}] Using no Saved Instance's Exchange Management API`, function() {
            it(`> When GET:/exchange/${_ctx.exchangeName} then return public ${_ctx.exchangeName}`, function(done) {
              this.timeout(TIMEOUT_MS);
              request(server)
                .get(`/exchange/${_ctx.exchangeName}`)
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                  should.not.exist(err);
        
                  res.body.private.should.eql(false);
        
                  done();
                });
            });
      
            it(`> When GET:/exchange/${_ctx.exchangeName} with invalid jwt token, then return 403`, function(done) {
              this.timeout(TIMEOUT_MS)
              const token = 'xxx.yyy.zzz'
              request(server)
                    .get(`/exchange/${_ctx.exchangeName}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect('Content-Type', /json/)
                    .expect(403)
                    .end((err, res) => {
                      should.not.exist(err);
                      done();
                    })
            });

            it(`> When GET:/exchange/${_ctx.exchangeName} with valid jwt token but referencing non-existent exchange, then return 404`, function(done) {
              this.timeout(TIMEOUT_MS)
              jwtHelper.sign(
                _ctx.exchangeName, 
                `${_ctx.exchangeName}_dummy`, 
                function(err, token) {
                  should.not.exist(err);
                  request(server)
                    .get(`/exchange/${_ctx.exchangeName}`)
                    .set('Authorization', `Bearer ${token}`)
                    .expect('Content-Type', /json/)
                    .expect(404)
                    .end((err, res) => {
                      should.not.exist(err);
                      done();
                    })
                })
            });
    
            it(`> When DELETE:/exchange/${_ctx.exchangeName} with no jwt token then return 403`, function(done) {
              this.timeout(TIMEOUT_MS);
              request(server)
                .delete(`/exchange/${_ctx.exchangeName}`)
                .expect('Content-Type', /json/)
                .expect(403)
                .end((err, res) => {
                  should.not.exist(err);
                  done();
                })
            });
          });

          describe(`> [${_ctx.exchangeName}] Using no Saved Instance\'s Public Data API`, function() {
            this.timeout(TIMEOUT_MS);
            it(`> GET:/exchange/${_ctx.exchangeName}/markets then use public ${_ctx.exchangeName} and return 200`, function(done) {
    
              request(server)
                  .get(`/exchange/${_ctx.exchangeName}/markets`)
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end((err, res) => {
                    should.not.exist(err);
                    done();
                  })
            });
    
            it(`> GET:/exchange/${_ctx.exchangeName}/orderBook?symbol=${_ctx.targetCurrencyPair} then use public ${_ctx.exchangeName} and return 200`, function(done) {
              this.timeout(TIMEOUT_MS);
              request(server)
                  .get(`/exchange/${_ctx.exchangeName}/orderBook`)
                  .query({ symbol: _ctx.targetCurrencyPair })
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end((err, res) => {
                    should.not.exist(err);
                    done();
                  })
            })
    
            it(`> GET:/exchange/${_ctx.exchangeName}/l2OrderBook?symbol=${_ctx.targetCurrencyPair} then use public ${_ctx.exchangeName} and return 200`, function(done) {
              this.timeout(TIMEOUT_MS);
              request(server)
                  .get(`/exchange/${_ctx.exchangeName}/l2OrderBook`)
                  .query({ symbol: _ctx.targetCurrencyPair })
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end((err, res) => {
                    should.not.exist(err);
                    done();
                  })
            })

            it(`> GET:/exchange/${_ctx.exchangeName}/trades?symbol=${_ctx.targetCurrencyPair} then use public ${_ctx.exchangeName} and return 200`, function(done) {
              this.timeout(TIMEOUT_MS)
              request(server)
                  .get(`/exchange/${_ctx.exchangeName}/trades`)
                  .query({ symbol: _ctx.targetCurrencyPair })
                  .retry(3)
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end((err, res) => {
                    should.not.exist(err);
                    done();
                  })
            })
    
            it(`> GET:/exchange/${_ctx.exchangeName}/ticker?symbol=${_ctx.targetCurrencyPair} then use public ${_ctx.exchangeName} and return ${_ctx.expectedStatusCodes['fetchTicker']}`, function(done) {
              this.timeout(TIMEOUT_MS)
              request(server)
                  .get(`/exchange/${_ctx.exchangeName}/ticker`)
                  .query({ symbol: _ctx.targetCurrencyPair })
                  .retry(3)
                  .expect('Content-Type', /json/)
                  .expect(_ctx.expectedStatusCodes['fetchTicker'])
                  .end((err, res) => {
                    should.not.exist(err);
                    done();
                  })
            })

            it(`> GET:/exchange/${_ctx.exchangeName}/tickers then return use public ${_ctx.exchangeName} and return ${_ctx.expectedStatusCodes['fetchTickers']}`, function(done) {
              this.timeout(TIMEOUT_MS)
              request(server)
                  .get(`/exchange/${_ctx.exchangeName}/tickers`)
                  .expect('Content-Type', /json/)
                  .expect(_ctx.expectedStatusCodes['fetchTickers'])
                  .end((err, res) => {
                    should.not.exist(err);
                    done();
                  })
            })
    
            it(`> POST:/exchange/${_ctx.exchangeName}/_/loadMarkets then use public ${_ctx.exchangeName} and return 200`, function(done) {
              this.timeout(TIMEOUT_MS)
              request(server)
                  .post(`/exchange/${_ctx.exchangeName}/_/loadMarkets`)
                  .type('text')
                  .send(JSON.stringify([true]))
                  .set('Accept', 'application/json')
                  .expect(200)
                  .end((err, res) => {
                    should.not.exist(err);
                    done();
                  })
            })
          });
        });
    
        describe(`> [${_ctx.exchangeName}] Given with saved exchange`, function() {
          var token

          before(function() {
            this.timeout(TIMEOUT_MS)
            return new Promise((resolve) => {
              request(server)
                .post(`/exchange/${_ctx.exchangeName}`)
                .send(_ctx.creds)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                  should.not.exist(err);

                  db.Exchange.findOne({
                    exchangeName:_ctx.exchangeName, 
                    exchangeId:_ctx.exchangeId
                  }).then(exchange => {
                    should.exist(exchange);
  
                    should.exist(res.body.token)
                    token = res.body.token
  
                    resolve();
                  }).catch(resolve)
                });
            });
          });

          after(function() {
            this.timeout(TIMEOUT_MS)
            return new Promise((resolve) => {
              db.Exchange.findOne({
                exchangeName:_ctx.exchangeName, 
                exchangeId:_ctx.exchangeId
              }).then(beforeDeleteExchange => {
                request(server)
                  .delete(`/exchange/${_ctx.exchangeName}`)
                  .set('Authorization', `Bearer ${token}`)
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end((err, res) => {
                    should.not.exist(err);
      
                    expect(res.body.name).to.be.eql(beforeDeleteExchange.name)

                    db.Exchange.findOne({
                      exchangeName:_ctx.exchangeName, 
                      exchangeId:_ctx.exchangeId
                    }).then(exchangeAfterDeletion => {
                      should.not.exist(exchangeAfterDeletion)
                      resolve()
                    }).catch(resolve)
                  });
              }).catch(resolve)
            });
          });

          describe(`> [${_ctx.exchangeName}] Using Saved Instance's Exchange Management APIs`, function() {
            it(`> GET:/exchange/${_ctx.exchangeName} then return id of new exchange`, function(done) {
              this.timeout(TIMEOUT_MS);
              request(server)
                  .get(`/exchange/${_ctx.exchangeName}`)
                  .set('Authorization', `Bearer ${token}`)
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end((err, res) => {
                    should.not.exist(err);
      
                    expect(res.body.private).to.be.true; 
      
                    done();
                  });
            });
      
            it(`> GET:/exchange/${_ctx.exchangeName} then get exchange`, function(done) {
              this.timeout(TIMEOUT_MS);
              request(server)
                  .get(`/exchange/${_ctx.exchangeName}`)
                  .set('Authorization', `Bearer ${token}`)
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end((err, res) => {
                    should.not.exist(err);

                    db.Exchange.findOne({
                      exchangeName:_ctx.exchangeName, 
                      exchangeId:_ctx.exchangeId
                    }).then(exchange => {
                      should.exist(exchange);
    
                      res.body.id.should.eql(_ctx.exchangeId);
                      done()
                    }).catch(done)
                  });
            });
    
          })

          describe(`> [${_ctx.exchangeName}] Using Saved Instance's Public Data APIs`, function() {
            it(`> GET:/exchange/${_ctx.exchangeName}/markets then get exchange's markets`, function(done) {
              this.timeout(TIMEOUT_MS)
              request(server)
                  .get(`/exchange/${_ctx.exchangeName}/markets`)
                  .set('Authorization', `Bearer ${token}`)
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end((err, res) => {
                    should.not.exist(err);
      
                    var symbols = res.body.map(entry => entry.symbol)
                    expect(symbols).to.include.members(_ctx.knownCurrencyPairs)
      
                    done();
                  });
            })
    
            it(`> GET:/exchange/${_ctx.exchangeName}/orderBook then get exchange's Order Book`, function(done) {
              this.timeout(TIMEOUT_MS)
              request(server)
                  .get(`/exchange/${_ctx.exchangeName}/orderBook`)
                  .query({ symbol: _ctx.targetCurrencyPair })
                  .set('Authorization', `Bearer ${token}`)
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end((err, res) => {
                    should.not.exist(err);
      
                    expect(res.body.bids.length).to.at.least(50);
                    expect(res.body.asks.length).to.at.least(50);
                    
                    done();
                  });
            })
    
            it(`> GET:/exchange/${_ctx.exchangeName}/orderBook with limit then get exchange's Order Book`, function(done) {
              this.timeout(TIMEOUT_MS)
              request(server)
                  .get(`/exchange/${_ctx.exchangeName}/orderBook`)
                  .query({ symbol: _ctx.targetCurrencyPair, limit: 50 })
                  .set('Authorization', `Bearer ${token}`)
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end((err, res) => {
                    should.not.exist(err);
      
                    expect(res.body.bids.length).to.eql(50);
                    expect(res.body.asks.length).to.eql(50);
      
                    done();
                  });
            })
    
            it(`> GET:/exchange/${_ctx.exchangeName}/l2OrderBook then get exchange's L2 Order Book`, function(done) {
              this.timeout(TIMEOUT_MS)
              request(server)
                  .get(`/exchange/${_ctx.exchangeName}/l2OrderBook`)
                  .query({ symbol: _ctx.targetCurrencyPair })
                  .set('Authorization', `Bearer ${token}`)
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end((err, res) => {
                    should.not.exist(err);
      
                    expect(res.body.bids.length).to.at.least(50);
                    expect(res.body.asks.length).to.at.least(50);
      
                    done();
                  });
            })
    
            it(`> GET:/exchange/${_ctx.exchangeName}/l2OrderBook with limit then get exchange's L2 Order Book`, function(done) {
              this.timeout(TIMEOUT_MS)
              request(server)
                  .get(`/exchange/${_ctx.exchangeName}/l2OrderBook`)
                  .query({ symbol: _ctx.targetCurrencyPair, limit: 50 })
                  .set('Authorization', `Bearer ${token}`)
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end((err, res) => {
                    should.not.exist(err);
      
                    expect(res.body.bids.length).to.eql(50);
                    expect(res.body.asks.length).to.eql(50);
      
                    done();
                  });
            })
    
            it(`> GET:/exchange/${_ctx.exchangeName}/trades then get exchange's trades`, function(done) {
              this.timeout(TIMEOUT_MS)
              request(server)
                  .get(`/exchange/${_ctx.exchangeName}/trades`)
                  .query({ symbol: _ctx.targetCurrencyPair })
                  .set('Authorization', `Bearer ${token}`)
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end((err, res) => {
                    should.not.exist(err);
      
                    expect(res.body.length).to.at.least(10);
      
                    done();
                  });
            })
    
            it(`> GET:/exchange/${_ctx.exchangeName}/ticker then return ' + ${_ctx.expectedStatusCodes['fetchTicker']}`, function(done) {
              this.timeout(TIMEOUT_MS)
              request(server)
                  .get(`/exchange/${_ctx.exchangeName}/ticker`)
                  .query({ symbol: _ctx.targetCurrencyPair })
                  .set('Authorization', `Bearer ${token}`)
                  .expect('Content-Type', /json/)
                  .expect(_ctx.expectedStatusCodes['fetchTicker'], done);
            })

            it(`> GET:/exchange/${_ctx.exchangeName}/tickers then ${_ctx.expectedStatusCodes['fetchTickers']}`, function(done) {
              this.timeout(TIMEOUT_MS)
              request(server)
                  .get(`/exchange/${_ctx.exchangeName}/tickers`)
                  .set('Authorization', `Bearer ${token}`)
                  .expect('Content-Type', /json/)
                  .expect(_ctx.expectedStatusCodes['fetchTickers'], done);
            })
    
            it(`> POST:/exchange/${_ctx.exchangeName}/_/loadMarkets then get exchange's direct method`, function(done) {
              this.timeout(TIMEOUT_MS)
              request(server)
                  .post(`/exchange/${_ctx.exchangeName}/_/loadMarkets`)
                  .type('text')
                  .send(JSON.stringify([true]))
                  .set('Accept', 'application/json')
                  .set('Authorization', `Bearer ${token}`)
                  .expect(200)
                  .end((err, res) => {
                    should.not.exist(err);
      
                    done();
                  });
            })
        
          });
    
          describe(`> [${_ctx.exchangeName}] Using Saved Instance's Private Data APIs`, function() {
            before(function() {
              if (!_ctx.creds) {
                console.info(`[SKIP REASON] No credentials found for ${_ctx.exchangeName}`)
                this.skip()
              }
            })
            it(`> GET:/exchange/${_ctx.exchangeName}/balances then get exchange's balances`, function(done) {
              this.timeout(TIMEOUT_MS)
              request(server)
                  .get(`/exchange/${_ctx.exchangeName}/balances`)
                  .set('Authorization', `Bearer ${token}`)
                  .expect('Content-Type', /json/)
                  .expect(200)
                  .end((err, res) => {
                    should.not.exist(err);
      
                    expect(res.body.info).to.exist;
                    expect(res.body.balances.length).to.be.at.least(1);
      
                    done();
                  });
            });

            for (var type of ['limit']) {
              for (var side of ['buy', 'sell']) {
                describe(`> [${_ctx.exchangeName}] Given with open ${type} ${side} order`, function() {
                  var orderId
                  before(function() {
                    this.timeout(TIMEOUT_MS)
                    return new Promise((resolve) => {

                      const path = `/exchange/${_ctx.exchangeName}`
                      request(server)
                        .get(path)
                        .set('Authorization', `Bearer ${token}`)
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end((err, res) => {
                          should.not.exist(err);

                          request(server)
                            .get(`${path}/markets`)
                            .set('Authorization', `Bearer ${token}`)
                            .expect('Content-Type', /json/)
                            .expect(200)
                            .end((err, res) => {
                              should.not.exist(err);
      
                              var market = res.body.find((market) => {
                                return market.symbol == _ctx.targetCurrencyPair
                              })

                              var minimumAmount = market.limits.amount.min
                              var minimumCost = market.limits.cost.min
                              var precisionAmount = market.precision.amount
      
                              request(server)
                                .get(`${path}/orderBook`)
                                .query({ symbol: _ctx.targetCurrencyPair })
                                .set('Authorization', `Bearer ${token}`)
                                .expect('Content-Type', /json/)
                                .expect(200)
                                .end((err, res) => {
                                  should.not.exist(err);
          
                                  var farLevel = (side == 'buy' ? res.body.bids : res.body.asks)[10]
      
                                  var price = farLevel.price
                                  var computedAmount = parseFloat(((minimumCost / price) + Math.pow(10, -1 * precisionAmount)).toFixed(precisionAmount))
                                  var amount = Math.max(minimumAmount, computedAmount)
          
                                  var orderPlacement = { symbol: _ctx.targetCurrencyPair, type: type, side: side, amount:amount, price:price }
                                  
                                  request(server)
                                    .post(`${path}/order`)
                                    .send(orderPlacement)
                                    .set('Accept', 'application/json')
                                    .set('Authorization', `Bearer ${token}`)
                                    .expect('Content-Type', /json/)
                                    .expect(200)
                                    .end((err, res) => {
                                      if (err) {
                                        console.info([orderPlacement, err])
                                      }
                                      should.not.exist(err);
          
                                      orderId = res.body.id
                        
                                      resolve();
                                    });
                                });
                            });
                        });
                    });
                  })

                  after(function() {
                    this.timeout(TIMEOUT_MS)
                    return new Promise((resolve) => {
                      if (orderId) {
                        request(server)
                          .delete(`/exchange/${_ctx.exchangeName}/order/${orderId}`)
                          .query({symbol : _ctx.targetCurrencyPair})
                          .set('Authorization', `Bearer ${token}`)
                          .expect('Content-Type', /json/)
                          .expect(200)
                          .end((err, res) => {
                            should.not.exist(err);
                
                            resolve();
                          });
                      }
                    });
                  });

                  it(`> [${_ctx.exchangeName}] Given with open ${type} ${side} order, get order`, function(done) {
                    this.timeout(TIMEOUT_MS)
                    request(server)
                          .get(`/exchange/${_ctx.exchangeName}/order/${orderId}`)
                          .query({symbol : _ctx.targetCurrencyPair})
                          .set('Authorization', `Bearer ${token}`)
                          .expect('Content-Type', /json/)
                          .expect(200)
                          .end((err, res) => {
                            should.not.exist(err);
                
                            done();
                          });
                  })

                  it(`> [${_ctx.exchangeName}] Given with open ${type} ${side} order, get orders, then ${_ctx.expectedStatusCodes['fetchOrders']}`, function(done) {
                    this.timeout(TIMEOUT_MS)
                    request(server)
                      .get(`/exchange/${_ctx.exchangeName}/orders`)
                      .query({symbol : _ctx.targetCurrencyPair})
                      .set('Authorization', `Bearer ${token}`)
                      .expect('Content-Type', /json/)
                      .expect(_ctx.expectedStatusCodes['fetchOrders'])
                      .end((err, res) => {
                        should.not.exist(err);
            
                        done();
                      });
                  })

                  it(`> [${_ctx.exchangeName}] Given with open ${type} ${side} order, get open orders`, function(done) {
                    this.timeout(TIMEOUT_MS)
                    request(server)
                          .get(`/exchange/${_ctx.exchangeName}/orders/open`)
                          .query({symbol : _ctx.targetCurrencyPair})
                          .set('Authorization', `Bearer ${token}`)
                          .expect('Content-Type', /json/)
                          .expect(200)
                          .end((err, res) => {
                            should.not.exist(err);
                
                            done();
                          });
                  })

                  it(`> [${_ctx.exchangeName}] Given with open ${type} ${side} order, get closed orders, then ${_ctx.expectedStatusCodes['fetchClosedOrders']}`, function(done) {
                    this.timeout(TIMEOUT_MS)
                    request(server)
                      .get(`/exchange/${_ctx.exchangeName}/orders/closed`)
                      .query({symbol : _ctx.targetCurrencyPair})
                      .set('Authorization', `Bearer ${token}`)
                      .expect('Content-Type', /json/)
                      .expect(_ctx.expectedStatusCodes['fetchClosedOrders'])
                      .end((err, res) => {
                        should.not.exist(err);
            
                        done();
                      });
                  })

                  it(`> [${_ctx.exchangeName}] Given with open ${type} ${side} order, get my trades, then ${_ctx.expectedStatusCodes['fetchMyTrades']}`, function(done) {
                    this.timeout(TIMEOUT_MS)
                    request(server)
                      .get(`/exchange/${_ctx.exchangeName}/trades/mine`)
                      .query({symbol : _ctx.targetCurrencyPair})
                      .set('Authorization', `Bearer ${token}`)
                      .expect('Content-Type', /json/)
                      .expect(_ctx.expectedStatusCodes['fetchMyTrades'])
                      .end((err, res) => {
                        should.not.exist(err);
            
                        done();
                      });
                  })
                });
              } // end of side for-loop
            } // end of type for-loop
          });

        });
      });

    }); // end of ccxt.exchanges for-loop

  });

});
