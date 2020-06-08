var ccxt = require('ccxt');
var should = require('should');
var request = require('supertest');
var fs = require('fs')

process.env.PORT = 0

var ccxtServer = require('../../../app')
var exchangeConfig = require('../../../api/config/exchange')

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

            res.body.should.eql(exchangeConfig.exchanges.map(i => '' + i));

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

    /*describe('> Given broken exchanges', function() {
      ['allcoin', 'quadrigacx'].forEach(function(exchangeName) {
        it(`> [${exchangeName}] When trying to instantiate, then 503`, function(done) {
          request(server)
            .post('/exchange/' + exchangeName)
            .send({id:exchangeName})
            .set('Accept', 'application/json')
            .expect(503, done);
        })
      })
    });*/

  });

});
