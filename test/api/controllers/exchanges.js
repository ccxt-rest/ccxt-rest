var should = require('should');
var request = require('supertest');
var server = require('../../../app');
var ccxt = require('ccxt')

describe('controllers', function() {

  describe('exchanges', function() {

    describe('GET /exchanges', function() {

      it('should return list of exchanges', function(done) {

        request(server)
          .get('/exchanges')
          .set('Accept', 'application/json')
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

});
