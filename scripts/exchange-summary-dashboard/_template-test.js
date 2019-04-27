const generateTest = require('../util').generateTest

const _ctx = {
    baseUrl : '%%baseUrl%%',
    exchangeName: '%%exchangeName%%',
    market: '%%market%%'
}

describe(`> [${_ctx.exchangeName}] without API keys`, function() {

    generateTest(_ctx, 'connect', {
        subPath: ''
    })

    generateTest(_ctx, 'markets', {
        successCallback: function(_ctx, res) {
            if (res && res.body && res.body.length > 0) {
                _ctx.market = res.body[0].symbol
            }
        }
    })

    generateTest(_ctx, 'ticker', {
        canExecute : function(_ctx) {
            return _ctx.market
        },
        queryBuilder : function(_ctx) {
            return {
                symbol : _ctx.market
            }
        }
    })

    generateTest(_ctx, 'tickers')

    generateTest(_ctx, 'orderBook', {
        canExecute : function(_ctx) {
            return _ctx.market
        },
        queryBuilder : function(_ctx) {
            return {
                symbol : _ctx.market
            }
        }
    })

    generateTest(_ctx, 'trades', {
        canExecute : function(_ctx) {
            return _ctx.market
        },
        queryBuilder : function(_ctx) {
            return {
                symbol : _ctx.market
            }
        }
    })
})
