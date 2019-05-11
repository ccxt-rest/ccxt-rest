const expect = require('chai').expect;
const should = require('should');
const superagent = require('superagent');

const db = require('../../../api/models');
const jwtHelper = require('../../../api/helpers/jwt-helper')

const TIMEOUT_MS = process.env.TIMEOUT_MS || 10000

const creds = JSON.parse('%%creds%%')
const knownCurrencyPairs = JSON.parse('%%knownCurrencyPairs%%')

let expectedStatusCodes = {
    fetchTicker : parseInt("%%expectedStatusCodesFetchTicker%%"),
    fetchOrders : parseInt("%%expectedStatusCodesFetchOrders%%"),
    fetchMyTrades : parseInt("%%expectedStatusCodesFetchMyTrades%%"),
    fetchTicker : parseInt("%%expectedStatusCodesFetchTicker%%"),
    fetchTickers : parseInt("%%expectedStatusCodesFetchTickers%%"),
    fetchClosedOrders : parseInt("%%expectedStatusCodesFetchClosedOrders%%")
}

describe(`> [%%exchangeName%%]`, function() {

    describe(`> [%%exchangeName%%] Given no saved exchanges`, function() {
      describe(`> [%%exchangeName%%] Using no Saved Instance's Exchange Management API`, function() {

        before(function() {
            return new Promise((resolve) => {
                jwtHelper.initialize()
                    .then(() => {
                        resolve()
                    })
            })
        })

        it(`> When GET:/exchange/%%exchangeName%% then return public %%exchangeName%%`, function(done) {
          this.timeout(TIMEOUT_MS);
          superagent
            .get(`%%baseUrl%%/exchange/%%exchangeName%%`)
            .end((err, res) => {
              expect(err).to.not.exist
              expect(res.type).to.eql('application/json')
              expect(res.status).to.eql(200)
    
              res.body.private.should.eql(false);
    
              done();
            });
        });
  
        it(`> When GET:/exchange/%%exchangeName%% with invalid jwt token, then return 403`, function(done) {
          this.timeout(TIMEOUT_MS)
          const token = 'xxx.yyy.zzz'
          superagent
            .get(`%%baseUrl%%/exchange/%%exchangeName%%`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(403)
                done();
            })
        });

        it(`> When GET:/exchange/%%exchangeName%% with valid jwt token but referencing non-existent exchange, then return 404`, function(done) {
          this.timeout(TIMEOUT_MS)
          jwtHelper.sign(
            `%%exchangeName%%`, 
            `%%exchangeName%%_dummy`, 
            function(err, token) {
              expect(err).to.not.exist
              superagent
                .get(`%%baseUrl%%/exchange/%%exchangeName%%`)
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                  expect(res.type).to.eql('application/json')
                  expect(res.status).to.eql(404)

                  done();
                })
            })
        });

        it(`> When DELETE:/exchange/%%exchangeName%% with no jwt token then return 403`, function(done) {
          this.timeout(TIMEOUT_MS);
          superagent
            .delete(`%%baseUrl%%/exchange/%%exchangeName%%`)
            .end((err, res) => {
              expect(res.type).to.eql('application/json')
              expect(res.status).to.eql(403)
              done();
            })
        });
      });

      describe(`> [%%exchangeName%%] Using no Saved Instance\'s Public Data API`, function() {
        this.timeout(TIMEOUT_MS);
        it(`> GET:/exchange/%%exchangeName%%/markets then use public %%exchangeName%% and return 200`, function(done) {

          superagent
              .get(`%%baseUrl%%/exchange/%%exchangeName%%/markets`)
              .end((err, res) => {
                expect(err).to.not.exist
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(200)
                done();
              })
        });

        it(`> GET:/exchange/%%exchangeName%%/orderBook?symbol=%%targetCurrencyPair%% then use public %%exchangeName%% and return 200`, function(done) {
          this.timeout(TIMEOUT_MS);
          superagent
              .get(`%%baseUrl%%/exchange/%%exchangeName%%/orderBook`)
              .query({ symbol: `%%targetCurrencyPair%%` })
              .end((err, res) => {
                expect(err).to.not.exist
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(200)
                done();
              })
        })

        it(`> GET:/exchange/%%exchangeName%%/l2OrderBook?symbol=%%targetCurrencyPair%% then use public %%exchangeName%% and return 200`, function(done) {
          this.timeout(TIMEOUT_MS);
          superagent
              .get(`%%baseUrl%%/exchange/%%exchangeName%%/l2OrderBook`)
              .query({ symbol: `%%targetCurrencyPair%%` })
              .end((err, res) => {
                expect(err).to.not.exist
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(200)
                done();
              })
        })

        it(`> GET:/exchange/%%exchangeName%%/trades?symbol=%%targetCurrencyPair%% then use public %%exchangeName%% and return 200`, function(done) {
          this.timeout(TIMEOUT_MS)
          superagent
              .get(`%%baseUrl%%/exchange/%%exchangeName%%/trades`)
              .query({ symbol: `%%targetCurrencyPair%%` })
              .retry(3)
              .end((err, res) => {
                expect(err).to.not.exist
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(200)
                done();
              })
        })

        it(`> GET:/exchange/%%exchangeName%%/ticker?symbol=%%targetCurrencyPair%% then use public %%exchangeName%% and return ${expectedStatusCodes['fetchTicker']}`, function(done) {
          this.timeout(TIMEOUT_MS)
          superagent
              .get(`%%baseUrl%%/exchange/%%exchangeName%%/ticker`)
              .query({ symbol: `%%targetCurrencyPair%%` })
              .retry(3)
              .end((err, res) => {
                expect(err).to.not.exist
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(200)
                done();
              })
        })

        it(`> GET:/exchange/%%exchangeName%%/tickers then return use public %%exchangeName%% and return ${expectedStatusCodes['fetchTickers']}`, function(done) {
          this.timeout(TIMEOUT_MS)
          superagent
              .get(`%%baseUrl%%/exchange/%%exchangeName%%/tickers`)
              .end((err, res) => {
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(expectedStatusCodes['fetchTickers'])
                if (expectedStatusCodes['fetchTickers'] >= 200 && expectedStatusCodes['fetchTickers'] < 300) {
                    expect(err).to.not.exist
                }
                done();
              })
        })

        it(`> POST:/exchange/%%exchangeName%%/_/loadMarkets then use public %%exchangeName%% and return 200`, function(done) {
          this.timeout(TIMEOUT_MS)
          superagent
              .post(`%%baseUrl%%/exchange/%%exchangeName%%/_/loadMarkets`)
              .send(JSON.stringify([true]))
              .set('Accept', 'application/json')
              .end((err, res) => {
                expect(res.status).to.eql(200)
                expect(res.type).to.eql('application/json')
                expect(err).to.not.exist
                done();
              })
        })
      });
    });

    describe(`> [%%exchangeName%%] Given with saved exchange`, function() {
      var token

      before(function() {
        this.timeout(TIMEOUT_MS)
        return new Promise((resolve) => {
          superagent
            .post(`%%baseUrl%%/exchange/%%exchangeName%%`)
            .send(creds)
            .set('Accept', 'application/json')
            .end((err, res) => {

              expect(err).to.not.exist
              expect(res.type).to.eql('application/json')
              expect(res.status).to.eql(200)

              db.Exchange.findOne({
                exchangeName:`%%exchangeName%%`, 
                exchangeId:`%%exchangeId%%`
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
            exchangeName:`%%exchangeName%%`, 
            exchangeId:`%%exchangeId%%`
          }).then(beforeDeleteExchange => {
            superagent
              .delete(`%%baseUrl%%/exchange/%%exchangeName%%`)
              .set('Authorization', `Bearer ${token}`)
              .end((err, res) => {
                expect(err).to.not.exist
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(200)
  
                expect(res.body.name).to.be.match(new RegExp(exchangeName, 'i'))

                db.Exchange.findOne({
                  exchangeName:`%%exchangeName%%`, 
                  exchangeId:`%%exchangeId%%`
                }).then(exchangeAfterDeletion => {
                  should.not.exist(exchangeAfterDeletion)
                  resolve()
                }).catch(resolve)
              });
          }).catch(resolve)
        });
      });

      describe(`> [%%exchangeName%%] Using Saved Instance's Exchange Management APIs`, function() {
        it(`> GET:/exchange/%%exchangeName%% then return id of new exchange`, function(done) {
          this.timeout(TIMEOUT_MS);
          superagent
              .get(`%%baseUrl%%/exchange/%%exchangeName%%`)
              .set('Authorization', `Bearer ${token}`)
              .end((err, res) => {
                expect(err).to.not.exist
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(200)
  
                expect(res.body.private).to.be.true; 
  
                done();
              });
        });
  
        it(`> GET:/exchange/%%exchangeName%% then get exchange`, function(done) {
          this.timeout(TIMEOUT_MS);
          superagent
              .get(`%%baseUrl%%/exchange/%%exchangeName%%`)
              .set('Authorization', `Bearer ${token}`)
              .end((err, res) => {
                expect(err).to.not.exist
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(200)

                db.Exchange.findOne({
                  exchangeName:`%%exchangeName%%`, 
                  exchangeId:`%%exchangeId%%`
                }).then(exchange => {
                  should.exist(exchange);

                  res.body.id.should.eql(`%%exchangeId%%`);
                  done()
                }).catch(done)
              });
        });

      })

      describe(`> [%%exchangeName%%] Using Saved Instance's Public Data APIs`, function() {
        it(`> GET:/exchange/%%exchangeName%%/markets then get exchange's markets`, function(done) {
          this.timeout(TIMEOUT_MS)
          superagent
              .get(`%%baseUrl%%/exchange/%%exchangeName%%/markets`)
              .set('Authorization', `Bearer ${token}`)
              .end((err, res) => {
                expect(err).to.not.exist
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(200)
  
                var symbols = res.body.map(entry => entry.symbol)
                expect(symbols).to.include.members(knownCurrencyPairs)
  
                done();
              });
        })

        it(`> GET:/exchange/%%exchangeName%%/orderBook then get exchange's Order Book`, function(done) {
          this.timeout(TIMEOUT_MS)
          superagent
              .get(`%%baseUrl%%/exchange/%%exchangeName%%/orderBook`)
              .query({ symbol: `%%targetCurrencyPair%%` })
              .set('Authorization', `Bearer ${token}`)
              .end((err, res) => {
                expect(err).to.not.exist
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(200)
  
                expect(res.body.bids.length).to.at.least(50);
                expect(res.body.asks.length).to.at.least(50);
                
                done();
              });
        })

        it(`> GET:/exchange/%%exchangeName%%/orderBook with limit then get exchange's Order Book`, function(done) {
          this.timeout(TIMEOUT_MS)
          superagent
              .get(`%%baseUrl%%/exchange/%%exchangeName%%/orderBook`)
              .query({ symbol: `%%targetCurrencyPair%%`, limit: 50 })
              .set('Authorization', `Bearer ${token}`)
              .end((err, res) => {
                expect(err).to.not.exist
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(200)
  
                expect(res.body.bids.length).to.eql(50);
                expect(res.body.asks.length).to.eql(50);
  
                done();
              });
        })

        it(`> GET:/exchange/%%exchangeName%%/l2OrderBook then get exchange's L2 Order Book`, function(done) {
          this.timeout(TIMEOUT_MS)
          superagent
              .get(`%%baseUrl%%/exchange/%%exchangeName%%/l2OrderBook`)
              .query({ symbol: `%%targetCurrencyPair%%` })
              .set('Authorization', `Bearer ${token}`)
              .end((err, res) => {
                expect(err).to.not.exist
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(200)
  
                expect(res.body.bids.length).to.at.least(50);
                expect(res.body.asks.length).to.at.least(50);
  
                done();
              });
        })

        it(`> GET:/exchange/%%exchangeName%%/l2OrderBook with limit then get exchange's L2 Order Book`, function(done) {
          this.timeout(TIMEOUT_MS)
          superagent
              .get(`%%baseUrl%%/exchange/%%exchangeName%%/l2OrderBook`)
              .query({ symbol: `%%targetCurrencyPair%%`, limit: 50 })
              .set('Authorization', `Bearer ${token}`)
              .end((err, res) => {
                expect(err).to.not.exist
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(200)
  
                expect(res.body.bids.length).to.eql(50);
                expect(res.body.asks.length).to.eql(50);
  
                done();
              });
        })

        it(`> GET:/exchange/%%exchangeName%%/trades then get exchange's trades`, function(done) {
          this.timeout(TIMEOUT_MS)
          superagent
              .get(`%%baseUrl%%/exchange/%%exchangeName%%/trades`)
              .query({ symbol: `%%targetCurrencyPair%%` })
              .set('Authorization', `Bearer ${token}`)
              .end((err, res) => {
                expect(err).to.not.exist
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(200)
  
                expect(res.body.length).to.at.least(10);
  
                done();
              });
        })

        it(`> GET:/exchange/%%exchangeName%%/ticker then return ' + ${expectedStatusCodes['fetchTicker']}`, function(done) {
          this.timeout(TIMEOUT_MS)
          superagent
              .get(`%%baseUrl%%/exchange/%%exchangeName%%/ticker`)
              .query({ symbol: `%%targetCurrencyPair%%` })
              .set('Authorization', `Bearer ${token}`)
              .end((err, res) => {
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(expectedStatusCodes['fetchTicker'])
                if (expectedStatusCodes['fetchTicker'] >= 200 && expectedStatusCodes['fetchTicker'] < 300) {
                    expect(err).to.not.exist
                }                
                done()
              })
        })

        it(`> GET:/exchange/%%exchangeName%%/tickers then ${expectedStatusCodes['fetchTickers']}`, function(done) {
          this.timeout(TIMEOUT_MS)
          superagent
              .get(`%%baseUrl%%/exchange/%%exchangeName%%/tickers`)
              .set('Authorization', `Bearer ${token}`)
              .end((err, res) => {
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(expectedStatusCodes['fetchTickers'])
                if (expectedStatusCodes['fetchTickers'] >= 200 && expectedStatusCodes['fetchTickers'] < 300) {
                    expect(err).to.not.exist
                }
                done()
              })
        })

        it(`> POST:/exchange/%%exchangeName%%/_/loadMarkets then get exchange's direct method`, function(done) {
          this.timeout(TIMEOUT_MS)
          superagent
              .post(`%%baseUrl%%/exchange/%%exchangeName%%/_/loadMarkets`)
              .type('text')
              .send(JSON.stringify([true]))
              .set('Accept', 'application/json')
              .set('Authorization', `Bearer ${token}`)
              .end((err, res) => {
                expect(err).to.not.exist
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(200)    
  
                done();
              });
        })
    
      });

      describe(`> [%%exchangeName%%] Using Saved Instance's Private Data APIs`, function() {
        before(function() {
          if (!creds) {
            console.info(`[SKIP REASON] No credentials found for %%exchangeName%%`)
            this.skip()
          }
        })
        it(`> GET:/exchange/%%exchangeName%%/balances then get exchange's balances`, function(done) {
          this.timeout(TIMEOUT_MS)
          superagent
              .get(`%%baseUrl%%/exchange/%%exchangeName%%/balances`)
              .set('Authorization', `Bearer ${token}`)
              .end((err, res) => {
                expect(err).to.not.exist
                expect(res.type).to.eql('application/json')
                expect(res.status).to.eql(200)
  
                expect(res.body.info).to.exist;
                expect(res.body.balances.length).to.be.at.least(1);
  
                done();
              });
        });

        for (var type of ['limit']) {
          for (var side of ['buy', 'sell']) {
            describe(`> [%%exchangeName%%] Given with open ${type} ${side} order`, function() {
              var orderId
              before(function() {
                this.timeout(TIMEOUT_MS)
                return new Promise((resolve) => {

                  const path = `%%baseUrl%%/exchange/%%exchangeName%%`
                  superagent
                    .get(path)
                    .set('Authorization', `Bearer ${token}`)
                    .end((err, res) => {
                      expect(err).to.not.exist
                      expect(res.type).to.eql('application/json')
                      expect(res.status).to.eql(200)

                      superagent
                        .get(`${path}/markets`)
                        .set('Authorization', `Bearer ${token}`)
                        .end((err, res) => {
                          expect(err).to.not.exist
                          expect(res.type).to.eql('application/json')
                          expect(res.status).to.eql(200)
  
                          var market = res.body.find((market) => {
                            return market.symbol == `%%targetCurrencyPair%%`
                          })

                          var minimumAmount = market.limits.amount.min
                          var minimumCost = market.limits.cost.min
                          var precisionAmount = market.precision.amount
  
                          superagent
                            .get(`${path}/orderBook`)
                            .query({ symbol: `%%targetCurrencyPair%%` })
                            .set('Authorization', `Bearer ${token}`)
                            .end((err, res) => {
                              expect(err).to.not.exist
                              expect(res.type).to.eql('application/json')
                              expect(res.status).to.eql(200)
      
                              var farLevel = (side == 'buy' ? res.body.bids : res.body.asks)[10]
  
                              var price = farLevel.price
                              var computedAmount = parseFloat(((minimumCost / price) + Math.pow(10, -1 * precisionAmount)).toFixed(precisionAmount))
                              var amount = Math.max(minimumAmount, computedAmount)
      
                              var orderPlacement = { symbol: `%%targetCurrencyPair%%`, type: type, side: side, amount:amount, price:price }
                              
                              superagent
                                .post(`${path}/order`)
                                .send(orderPlacement)
                                .set('Accept', 'application/json')
                                .set('Authorization', `Bearer ${token}`)
                                .end((err, res) => {
                                  if (err) {
                                    console.info([orderPlacement, err])
                                  }
                                  expect(err).to.not.exist
                                  expect(res.type).to.eql('application/json')
                                  expect(res.status).to.eql(200)
      
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
                    superagent
                      .delete(`%%baseUrl%%/exchange/%%exchangeName%%/order/${orderId}`)
                      .query({symbol : `%%targetCurrencyPair%%`})
                      .set('Authorization', `Bearer ${token}`)
                      .end((err, res) => {
                        expect(err).to.not.exist
                        expect(res.type).to.eql('application/json')
                        expect(res.status).to.eql(200)
            
                        resolve();
                      });
                  }
                });
              });

              it(`> [%%exchangeName%%] Given with open ${type} ${side} order, get order`, function(done) {
                this.timeout(TIMEOUT_MS)
                superagent
                      .get(`%%baseUrl%%/exchange/%%exchangeName%%/order/${orderId}`)
                      .query({symbol : `%%targetCurrencyPair%%`})
                      .set('Authorization', `Bearer ${token}`)
                      .end((err, res) => {
                        expect(err).to.not.exist
                        expect(res.type).to.eql('application/json')
                        expect(res.status).to.eql(200)
            
                        done();
                      });
              })

              it(`> [%%exchangeName%%] Given with open ${type} ${side} order, get orders, then ${expectedStatusCodes['fetchOrders']}`, function(done) {
                this.timeout(TIMEOUT_MS)
                superagent
                  .get(`%%baseUrl%%/exchange/%%exchangeName%%/orders`)
                  .query({symbol : `%%targetCurrencyPair%%`})
                  .set('Authorization', `Bearer ${token}`)
                  .end((err, res) => {
                    expect(res.type).to.eql('application/json')
                    expect(res.status).to.eql(expectedStatusCodes['fetchOrders'])
                    if (expectedStatusCodes['fetchOrders'] >= 200 && expectedStatusCodes['fetchOrders'] < 300) {
                        expect(err).to.not.exist
                    }
        
                    done();
                  });
              })

              it(`> [%%exchangeName%%] Given with open ${type} ${side} order, get open orders`, function(done) {
                this.timeout(TIMEOUT_MS)
                superagent
                      .get(`%%baseUrl%%/exchange/%%exchangeName%%/orders/open`)
                      .query({symbol : `%%targetCurrencyPair%%`})
                      .set('Authorization', `Bearer ${token}`)
                      .end((err, res) => {
                        expect(err).to.not.exist
                        expect(res.type).to.eql('application/json')
                        expect(res.status).to.eql(200)
            
                        done();
                      });
              })

              it(`> [%%exchangeName%%] Given with open ${type} ${side} order, get closed orders, then ${expectedStatusCodes['fetchClosedOrders']}`, function(done) {
                this.timeout(TIMEOUT_MS)
                superagent
                  .get(`%%baseUrl%%/exchange/%%exchangeName%%/orders/closed`)
                  .query({symbol : `%%targetCurrencyPair%%`})
                  .set('Authorization', `Bearer ${token}`)
                  .end((err, res) => {
                    expect(res.type).to.eql('application/json')
                    expect(res.status).to.eql(expectedStatusCodes['fetchClosedOrders'])
                    if (expectedStatusCodes['fetchClosedOrders'] >= 200 && expectedStatusCodes['fetchClosedOrders'] < 300) {
                        expect(err).to.not.exist
                    }
        
                    done();
                  });
              })

              it(`> [%%exchangeName%%] Given with open ${type} ${side} order, get my trades, then ${expectedStatusCodes['fetchMyTrades']}`, function(done) {
                this.timeout(TIMEOUT_MS)
                superagent
                  .get(`%%baseUrl%%/exchange/%%exchangeName%%/trades/mine`)
                  .query({symbol : `%%targetCurrencyPair%%`})
                  .set('Authorization', `Bearer ${token}`)
                  .end((err, res) => {
                    expect(res.type).to.eql('application/json')
                    expect(res.status).to.eql(expectedStatusCodes['fetchMyTrades'])
                    if (expectedStatusCodes['fetchMyTrades'] >= 200 && expectedStatusCodes['fetchMyTrades'] < 300) {
                        expect(err).to.not.exist
                    }
        
                    done();
                  });
              })
            });
          } // end of side for-loop
        } // end of type for-loop
      });

    });
});
