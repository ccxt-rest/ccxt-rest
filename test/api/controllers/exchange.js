var ccxt = require('ccxt');
var expect = require('chai').expect;
var should = require('should');
var request = require('supertest');

process.env.PORT = 0

var server = require('../../../app');
var db = require('../../../api/helpers/db');

var ccxtRestTestExchangeDetails = process.env.CCXTREST_TEST_EXCHANGEDETAILS
var exchangeDetailsMap = JSON.parse(ccxtRestTestExchangeDetails)

describe('> controllers', function() {

  describe('> exchange', function() {

    describe('> Given unsupported exchange name', function() {
      describe('> [Unsupported Exchange name] Exchange Management API', function() {
        it('> GET:/exchange/nonExistentExchangeName then return 404', function(done) {  
          request(server)
            .get('/exchange/nonExistentExchangeName')
            .set('Accept', 'application/json')
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
        it('> GET:/exchange/nonExistentExchangeName/dummy/markets then return 404', function(done) {

          request(server)
              .get('/exchange/nonExistentExchangeName/dummy/markets')
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(404)
              .end((err, res) => {
                should.not.exist(err);
                done();
              })
        });

        it('> GET:/exchange/nonExistentExchangeName/dummy/orderBook then return 404', function(done) {
          this.timeout('10s');
          request(server)
              .get('/exchange/nonExistentExchangeName/dummy/orderBook')
              .query({ symbol: 'BTC/ETH' })
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(404)
              .end((err, res) => {
                should.not.exist(err);
                done();
              })
        })

        it('> GET:/exchange/nonExistentExchangeName/dummy/l2OrderBook then return 404', function(done) {
          this.timeout('10s');
          request(server)
              .get('/exchange/nonExistentExchangeName/dummy/l2OrderBook')
              .query({ symbol: 'BTC/ETH' })
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(404)
              .end((err, res) => {
                should.not.exist(err);
                done();
              })
        })

        it('> GET:/exchange/nonExistentExchangeName/dummy/trades then return 404', function(done) {
          this.timeout('10s')
          request(server)
              .get('/exchange/nonExistentExchangeName/dummy/trades')
              .query({ symbol: 'BTC/ETH' })
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(404)
              .end((err, res) => {
                should.not.exist(err);
                done();
              })
        })

        it('> GET:/exchange/nonExistentExchangeName/dummy/ticker then return 404', function(done) {
          this.timeout('10s')
          request(server)
              .get('/exchange/nonExistentExchangeName/dummy/ticker')
              .query({ symbol: 'BTC/ETH' })
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(404)
              .end((err, res) => {
                should.not.exist(err);
                done();
              })
        })

        it('> GET:/exchange/nonExistentExchangeName/dummy/tickers then return 404', function(done) {
          this.timeout('10s')
          request(server)
              .get('/exchange/nonExistentExchangeName/dummy/tickers')
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(404)
              .end((err, res) => {
                should.not.exist(err);
                done();
              })
        })

        it('> POST:/exchange/nonExistentExchangeName/dummy/_/loadMarkets then return 404', function(done) {
          this.timeout('10s')
          request(server)
              .post('/exchange/nonExistentExchangeName/dummy/_/loadMarkets')
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
        it('> GET:/exchange/nonExistentExchangeName/dummy/balances then get exchange\'s balances then return 404', function(done) {
          this.timeout('10s')
          request(server)
              .get('/exchange/nonExistentExchangeName/dummy/balances')
              .query({ symbol: 'BTC/ETH' })
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(404)
              .end((err, res) => {
                should.not.exist(err);
                done();
              })
        });

        it('> [Unsupported Exchange Name] Place order then return 404', function(done) {
          request(server)
            .post('/exchange/nonExistentExchangeName/dummy/order')
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
            .delete('/exchange/nonExistentExchangeName/dummy/order/dummy')
            .query({symbol : 'BTC/ETH'})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
            .end((err, res) => {
              should.not.exist(err);
              done();
            })
        })

        it('> [Unsupported Exchange Name] Get order then return 404', function(done) {
          this.timeout('10s')
          request(server)
            .get('/exchange/nonExistentExchangeName/dummy/order/dummy')
            .query({symbol : 'BTC/ETH'})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
            .end((err, res) => {
              should.not.exist(err);
              done();
            })
        })

        it('> [Unsupported Exchange Name] Get orders then return 404', function(done) {
          this.timeout('10s')
          request(server)
            .get('/exchange/nonExistentExchangeName/dummy/orders')
            .query({symbol : 'BTC/ETH'})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
            .end((err, res) => {
              should.not.exist(err);
              done();
            })
        })

        it('> [Unsupported Exchange Name] Get open orders then return 404', function(done) {
          this.timeout('10s')
          request(server)
            .get('/exchange/nonExistentExchangeName/dummy/orders/open')
            .query({symbol : 'BTC/ETH'})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
            .end((err, res) => {
              should.not.exist(err);
              done();
            })
        })

        it('> [Unsupported Exchange Name] Get closed orders then return 404', function(done) {
          this.timeout('10s')
          request(server)
            .get('/exchange/nonExistentExchangeName/dummy/orders/closed')
            .query({symbol : 'BTC/ETH'})
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(404)
            .end((err, res) => {
              should.not.exist(err);
              done();
            })
        })

        it('> [Unsupported Exchange Name] Get my trades then return 404', function(done) {
          this.timeout('10s')
          request(server)
            .get('/exchange/nonExistentExchangeName/dummy/trades/mine')
            .query({symbol : 'BTC/ETH'})
            .set('Accept', 'application/json')
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
        it('> [' + exchangeName + '] When trying to instantiate, then 503', function(done) {
          request(server)
            .post('/exchange/' + exchangeName)
            .send({id:exchangeName})
            .set('Accept', 'application/json')
            .expect(503, done);
        })
      })
    });

    // ccxt.exchanges
    ['bitso', 'binance'].map(exchangeName => {
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
      describe('> [' + _ctx.exchangeName + '] Given no saved exchanges', function() {
        describe('> [' + _ctx.exchangeName + '] Using no Saved Instance\'s Exchange Management API', function() {
          it('> When GET:/exchange/' + _ctx.exchangeName + ' then return empty array', function(done) {
  
            request(server)
              .get('/exchange/' + _ctx.exchangeName)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .end((err, res) => {
                should.not.exist(err);
      
                res.body.should.eql([]);
      
                done();
              });
          });
    
          it('> When GET:/exchange/' + _ctx.exchangeName + '/nonExistentId then return 404', function(done) {
    
            request(server)
              .get('/exchange/' + _ctx.exchangeName + '/nonExistentId')
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(404)
              .end((err, res) => {
                should.not.exist(err);
                done();
              })
          });
  
          it('> When DELETE:/exchange/' + _ctx.exchangeName + '/nonExistentId then return 404', function(done) {
    
            request(server)
              .delete('/exchange/' + _ctx.exchangeName + '/nonExistentId')
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(404)
              .end((err, res) => {
                should.not.exist(err);
                done();
              })
          });
        });

        describe('> [' + _ctx.exchangeName + '] Using no Saved Instance\'s Public Data API', function() {
          it('> GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/markets then return 404', function(done) {
  
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/markets')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(404)
                .end((err, res) => {
                  should.not.exist(err);
                  done();
                })
          });
  
          it('> GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/orderBook then return 404', function(done) {
            this.timeout('10s');
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/orderBook')
                .query({ symbol: _ctx.targetCurrencyPair })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(404)
                .end((err, res) => {
                  should.not.exist(err);
                  done();
                })
          })
  
          it('> GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/l2OrderBook then return 404', function(done) {
            this.timeout('10s');
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/l2OrderBook')
                .query({ symbol: _ctx.targetCurrencyPair })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(404)
                .end((err, res) => {
                  should.not.exist(err);
                  done();
                })
          })

          it('> GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/trades then return 404', function(done) {
            this.timeout('10s')
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/trades')
                .query({ symbol: _ctx.targetCurrencyPair })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(404)
                .end((err, res) => {
                  should.not.exist(err);
                  done();
                })
          })
  
          it('> GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/ticker then return 404', function(done) {
            this.timeout('10s')
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/ticker')
                .query({ symbol: _ctx.targetCurrencyPair })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(404)
                .end((err, res) => {
                  should.not.exist(err);
                  done();
                })
          })

          it('> GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/tickers then return 404', function(done) {
            this.timeout('10s')
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/tickers')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(404)
                .end((err, res) => {
                  should.not.exist(err);
                  done();
                })
          })
  
          it('> POST:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/_/loadMarkets then return 404', function(done) {
            this.timeout('10s')
            request(server)
                .post('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/_/loadMarkets')
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
      });
  
      describe('> [' + _ctx.exchangeName + '] Given with saved exchange', function() {
        before(function() {
          this.timeout('10s')
          return new Promise((resolve) => {
            request(server)
              .post('/exchange/' + _ctx.exchangeName)
              .send(_ctx.creds)
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(200)
              .end((err, res) => {
                should.not.exist(err);
  
                var exchange = db.getExchange(_ctx.exchangeName, _ctx.exchangeId);
                should.exist(exchange);

                res.body.name.should.eql(exchange.name);

                resolve();
              });
          });
        });

        after(function() {
          this.timeout('10s')
          return new Promise((resolve) => {
            var beforeDeleteExchange = db.getExchange(_ctx.exchangeName, _ctx.exchangeId);
  
            request(server)
                .delete('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                  should.not.exist(err);
    
                  res.body.name.should.eql(beforeDeleteExchange.name);
    
                  should.not.exist(db.getExchange(_ctx.exchangeName, _ctx.exchangeId));
    
                  resolve();
                });
          });
        });

        describe('> [' + _ctx.exchangeName + '] Using Saved Instance\'s Exchange Management APIs', function() {
          it('> GET:/exchange/' + _ctx.exchangeName + ' then return id of new exchange', function(done) {
            request(server)
                .get('/exchange/' + _ctx.exchangeName)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                  should.not.exist(err);
    
                  res.body.should.eql([_ctx.exchangeId]);
    
                  done();
                });
          });
    
          it('> GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + ' then get exchange', function(done) {
    
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                  should.not.exist(err);
    
                  var exchange = db.getExchange(_ctx.exchangeName, _ctx.exchangeId);
                  should.exist(exchange);
  
                  res.body.name.should.eql(exchange.name);
    
                  done();
                });
          });
  
        })

        describe('> [' + _ctx.exchangeName + '] Using Saved Instance\'s Public Data APIs', function() {
          it('> GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/markets then get exchange\'s markets', function(done) {
            this.timeout('10s')
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/markets')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                  should.not.exist(err);
    
                  var symbols = res.body.map(entry => entry.symbol)
                  expect(symbols).to.include.members(_ctx.knownCurrencyPairs)
    
                  done();
                });
          })
  
          it('> GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/orderBook then get exchange\'s Order Book', function(done) {
            this.timeout('10s')
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/orderBook')
                .query({ symbol: _ctx.targetCurrencyPair })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                  should.not.exist(err);
    
                  expect(res.body.bids.length).to.at.least(50);
                  expect(res.body.asks.length).to.at.least(50);
                  
                  done();
                });
          })
  
          it('> GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/orderBook with limit then get exchange\'s Order Book', function(done) {
            this.timeout('10s')
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/orderBook')
                .query({ symbol: _ctx.targetCurrencyPair, limit: 50 })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                  should.not.exist(err);
    
                  expect(res.body.bids.length).to.eql(50);
                  expect(res.body.asks.length).to.eql(50);
    
                  done();
                });
          })
  
          it('> GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/l2OrderBook then get exchange\'s L2 Order Book', function(done) {
            this.timeout('10s')
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/l2OrderBook')
                .query({ symbol: _ctx.targetCurrencyPair })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                  should.not.exist(err);
    
                  expect(res.body.bids.length).to.at.least(50);
                  expect(res.body.asks.length).to.at.least(50);
    
                  done();
                });
          })
  
          it('> GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/l2OrderBook with limit then get exchange\'s L2 Order Book', function(done) {
            this.timeout('10s')
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/l2OrderBook')
                .query({ symbol: _ctx.targetCurrencyPair, limit: 50 })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                  should.not.exist(err);
    
                  expect(res.body.bids.length).to.eql(50);
                  expect(res.body.asks.length).to.eql(50);
    
                  done();
                });
          })
  
          it('> GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/trades then get exchange\'s trades', function(done) {
            this.timeout('10s')
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/trades')
                .query({ symbol: _ctx.targetCurrencyPair })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                  should.not.exist(err);
    
                  expect(res.body.length).to.at.least(10);
    
                  done();
                });
          })
  
          it('> GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/ticker then ' + _ctx.expectedStatusCodes['fetchTicker'], function(done) {
            this.timeout('10s')
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/ticker')
                .query({ symbol: _ctx.targetCurrencyPair })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(_ctx.expectedStatusCodes['fetchTicker'], done);
          })

          it('> GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/tickers then ' + _ctx.expectedStatusCodes['fetchTickers'], function(done) {
            this.timeout('10s')
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/tickers')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(_ctx.expectedStatusCodes['fetchTickers'], done);
          })
  
          it('> POST:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/_/loadMarkets then get exchange\'s direct method', function(done) {
            this.timeout('10s')
            request(server)
                .post('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/_/loadMarkets')
                .type('text')
                .send(JSON.stringify([true]))
                .set('Accept', 'application/json')
                .expect(200)
                .end((err, res) => {
                  should.not.exist(err);
    
                  done();
                });
          })
      
        });
  
        describe('> [' + _ctx.exchangeName + '] Using Saved Instance\'s Private Data APIs', function() {
          before(function() {
            if (!_ctx.creds) {
              console.info('[SKIP REASON] No credentials found for ' + _ctx.exchangeName)
              this.skip()
            }
          })
          it('> GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/balances then get exchange\'s balances', function(done) {
            this.timeout('10s')
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/balances')
                .query({ symbol: _ctx.targetCurrencyPair })
                .set('Accept', 'application/json')
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
              describe('> [' + _ctx.exchangeName + '] Given with open ' + type + ' ' + side + ' order', function() {
                var exchange
                var orderId
                before(function() {
                  this.timeout('10s')
                  return new Promise((resolve) => {

                    const path = '/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId
                    request(server)
                      .get(path)
                      .set('Accept', 'application/json')
                      .expect('Content-Type', /json/)
                      .expect(200)
                      .end((err, res) => {
                        should.not.exist(err);

                        exchange = res.body

                        request(server)
                          .get(path + '/markets')
                          .set('Accept', 'application/json')
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
                              .get(path + '/orderBook')
                              .query({ symbol: _ctx.targetCurrencyPair })
                              .set('Accept', 'application/json')
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
                                  .post(path + '/order')
                                  .send(orderPlacement)
                                  .set('Accept', 'application/json')
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
                  this.timeout('10s')
                  return new Promise((resolve) => {
                    if (orderId) {
                      request(server)
                        .delete('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/order/' + orderId)
                        .query({symbol : _ctx.targetCurrencyPair})
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end((err, res) => {
                          should.not.exist(err);
              
                          resolve();
                        });
                    }
                  });
                });

                it('> [' + _ctx.exchangeName + '] Given with open ' + type + ' ' + side + ' order, get order', function(done) {
                  this.timeout('10s')
                  request(server)
                        .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/order/' + orderId)
                        .query({symbol : _ctx.targetCurrencyPair})
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end((err, res) => {
                          should.not.exist(err);
              
                          done();
                        });
                })

                it('> [' + _ctx.exchangeName + '] Given with open ' + type + ' ' + side + ' order, get orders, then ' + _ctx.expectedStatusCodes['fetchOrders'], function(done) {
                  this.timeout('10s')
                  request(server)
                    .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/orders')
                    .query({symbol : _ctx.targetCurrencyPair})
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(_ctx.expectedStatusCodes['fetchOrders'])
                    .end((err, res) => {
                      should.not.exist(err);
          
                      done();
                    });
                })

                it('> [' + _ctx.exchangeName + '] Given with open ' + type + ' ' + side + ' order, get open orders', function(done) {
                  this.timeout('10s')
                  request(server)
                        .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/orders/open')
                        .query({symbol : _ctx.targetCurrencyPair})
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .expect(200)
                        .end((err, res) => {
                          should.not.exist(err);
              
                          done();
                        });
                })

                it('> [' + _ctx.exchangeName + '] Given with open ' + type + ' ' + side + ' order, get closed orders, then ' + _ctx.expectedStatusCodes['fetchClosedOrders'], function(done) {
                  this.timeout('10s')
                  request(server)
                    .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/orders/closed')
                    .query({symbol : _ctx.targetCurrencyPair})
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(_ctx.expectedStatusCodes['fetchClosedOrders'])
                    .end((err, res) => {
                      should.not.exist(err);
          
                      done();
                    });
                })

                it('> [' + _ctx.exchangeName + '] Given with open ' + type + ' ' + side + ' order, get my trades, then ' + _ctx.expectedStatusCodes['fetchMyTrades'], function(done) {
                  this.timeout('10s')
                  request(server)
                    .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/trades/mine')
                    .query({symbol : _ctx.targetCurrencyPair})
                    .set('Accept', 'application/json')
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

    }); // end of ccxt.exchanges for-loop

  });

});
