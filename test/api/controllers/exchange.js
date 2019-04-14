var ccxt = require('ccxt');
var expect = require('chai').expect;
var should = require('should');
var request = require('supertest');

var server = require('../../../app');
var db = require('../../../api/helpers/db');

var ccxtRestTestExchangeDetails = process.env.CCXTREST_TEST_EXCHANGEDETAILS
console.log('Sanity Spot Check : Test Config : ' + ccxtRestTestExchangeDetails.slice(0, 20))
var exchangeDetailsMap = JSON.parse(ccxtRestTestExchangeDetails)

describe('controllers', function() {

  describe('exchange', function() {

    it('GET:/exchange/nonExistentExchangeName then return 404', function(done) {  
      request(server)
        .get('/exchange/nonExistentExchangeName')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404, done);
    });

    // ccxt.exchanges
    ['bitso', 'binance'].map(exchangeName => {
      var exchangeDetails = exchangeDetailsMap[exchangeName] || {}
      exchangeDetails.exchangeName = exchangeName
      exchangeDetails.exchangeId = exchangeDetails.creds.id
      return exchangeDetails
    }).forEach((_ctx) => {
      describe('[' + _ctx.exchangeName + '] Given no saved exchanges', function() {
        describe('[' + _ctx.exchangeName + '] No Saved public apis', function() {
          it('When GET:/exchange/' + _ctx.exchangeName + ' then return empty array', function(done) {
  
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
    
          it('When GET:/exchange/' + _ctx.exchangeName + '/nonExistentId then return 404', function(done) {
    
            request(server)
              .get('/exchange/' + _ctx.exchangeName + '/nonExistentId')
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(404, done);
          });
  
          it('GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/markets then get exchange\'s markets', function(done) {
  
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/markets')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(404, done);
          });
  
          it('GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/orderBook then get exchange\'s Order Book', function(done) {
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/orderBook')
                .query({ symbol: _ctx.targetCurrencyPair })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(404, done);
          }).timeout('10s');
  
          it('GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/l2OrderBook then get exchange\'s L2 Order Book', function(done) {
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/l2OrderBook')
                .query({ symbol: _ctx.targetCurrencyPair })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(404, done);
          }).timeout('10s');
    
          it('When DELETE:/exchange/' + _ctx.exchangeName + '/nonExistentId then return 404', function(done) {
    
            request(server)
              .delete('/exchange/' + _ctx.exchangeName + '/nonExistentId')
              .set('Accept', 'application/json')
              .expect('Content-Type', /json/)
              .expect(404, done);
          });
        });
      });
  
      describe('[' + _ctx.exchangeName + '] Given with saved exchange', function() {
        before(function() {
          this.timeout(10000)
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
          this.timeout(10000)
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

        describe('[' + _ctx.exchangeName + '] Saved public apis', function() {
          it('GET:/exchange/' + _ctx.exchangeName + ' then return id of new exchange', function(done) {
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
    
          it('GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + ' then get exchange', function(done) {
    
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
  
          it('GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/markets then get exchange\'s markets', function(done) {
  
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
          }).timeout('10s');
  
          it('GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/orderBook then get exchange\'s Order Book', function(done) {
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
          }).timeout('10s');
  
          it('GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/orderBook with limit then get exchange\'s Order Book', function(done) {
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
          }).timeout('10s');
  
          it('GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/l2OrderBook then get exchange\'s L2 Order Book', function(done) {
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
          }).timeout('10s');
  
          it('GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/l2OrderBook with limit then get exchange\'s L2 Order Book', function(done) {
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
          }).timeout('10s');
  
          it('GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/trades then get exchange\'s trades', function(done) {
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
          }).timeout('10s');
  
          it('GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/ticker then get exchange\'s ticker', function(done) {
            request(server)
                .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/ticker')
                .query({ symbol: _ctx.targetCurrencyPair })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                  should.not.exist(err);
    
                  expect(res.body.symbol).to.be.eql(_ctx.targetCurrencyPair);
    
                  done();
                });
          }).timeout('10s');
  
          it('POST:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/_/loadMarkets then get exchange\'s direct method', function(done) {
            request(server)
                .post('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/_/loadMarkets')
                .send([true])
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end((err, res) => {
                  should.not.exist(err);
    
                  done();
                });
          }).timeout('10s');
      
        });
  
        describe('[' + _ctx.exchangeName + '] Saved private apis', function() {
          it('GET:/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/balances then get exchange\'s balances', function(done) {
            this.timeout(10000)
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
              describe('[' + _ctx.exchangeName + '] Given with open ' + type + ' ' + side + ' order', function() {
                var exchange
                var orderId
                before(function() {
                  this.timeout(10000)
                  return new Promise((resolve) => {

                    request(server)
                      .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId)
                      .set('Accept', 'application/json')
                      .expect('Content-Type', /json/)
                      .expect(200)
                      .end((err, res) => {
                        should.not.exist(err);

                        exchange = res.body

                        request(server)
                          .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/markets')
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
                              .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/orderBook')
                              .query({ symbol: _ctx.targetCurrencyPair })
                              .set('Accept', 'application/json')
                              .expect('Content-Type', /json/)
                              .expect(200)
                              .end((err, res) => {
                                should.not.exist(err);
        
                                var farLevel = (side == 'buy' ? res.body.bids : res.body.asks)[10]
    
                                var price = farLevel.price
                                var amount = parseFloat(Math.max(minimumAmount, minimumCost / price).toFixed(precisionAmount)) + Math.pow(10, -1 * precisionAmount)
        
                                var orderPlacement = { symbol: _ctx.targetCurrencyPair, type: type, side: side, amount:amount, price:price }
                                
                                request(server)
                                  .post('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/order')
                                  .send(orderPlacement)
                                  .set('Accept', 'application/json')
                                  .expect('Content-Type', /json/)
                                  .expect(200)
                                  .end((err, res) => {
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
                  this.timeout(10000)
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

                it('[' + _ctx.exchangeName + '] Given with open ' + type + ' ' + side + ' order, get order', function(done) {
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
                }).timeout('10s')

                it('[' + _ctx.exchangeName + '] Given with open ' + type + ' ' + side + ' order, get orders', function(done) {
                  if (exchange.has.fetchOrders == 'false') {
                    done();
                    return;
                  }
                  request(server)
                    .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/orders')
                    .query({symbol : _ctx.targetCurrencyPair})
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end((err, res) => {
                      should.not.exist(err);
          
                      done();
                    });
                }).timeout('10s')

                it('[' + _ctx.exchangeName + '] Given with open ' + type + ' ' + side + ' order, get open orders', function(done) {
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
                }).timeout('10s')

                it('[' + _ctx.exchangeName + '] Given with open ' + type + ' ' + side + ' order, get closed orders', function(done) {
                  if (exchange.has.fetchClosedOrders == 'false') {
                    done();
                    return;
                  }
                  request(server)
                    .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/orders/closed')
                    .query({symbol : _ctx.targetCurrencyPair})
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end((err, res) => {
                      should.not.exist(err);
          
                      done();
                    });
                }).timeout('10s')

                it('[' + _ctx.exchangeName + '] Given with open ' + type + ' ' + side + ' order, get my trades', function(done) {
                  if (exchange.has.fetchMyTrades == 'false') {
                    done();
                    return;
                  }
                  request(server)
                    .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/trades/mine')
                    .query({symbol : _ctx.targetCurrencyPair})
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end((err, res) => {
                      should.not.exist(err);
          
                      done();
                    });
                }).timeout('10s')
              });
            } // end of side for-loop
          } // end of type for-loop
        });

      });

    }); // end of ccxt.exchanges for-loop

  });

});
