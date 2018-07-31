var expect = require('chai').expect
  , src = require('.').src;

var db = require(src('db'));

describe('Database', function () {

    describe('getExchangeIds()', function() {
        it('Given no stored exchanges', function() {
            var exchangeIds = db.getExchangeIds('exchangeName-with-no-saved-exchange');
            expect(exchangeIds).to.deep.equal([]);
        });

        it('Given has stored exchanges', function() {
            db.saveExchange('dummy', {id : 'dummyyId'});
            var exchangeIds = db.getExchangeIds('dummy');
            expect(exchangeIds).to.deep.equal(['dummyyId']);
        });
    })
});