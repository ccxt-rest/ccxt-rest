const superagent = require('superagent')

function getUnattractiveOrderPlacement(baseUrl, exchangeName, token, symbol, side) {
    return new Promise((resolve, reject) => {
        const path = `${baseUrl}/exchange/${exchangeName}`
        superagent
            .get(`${path}/markets`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                if (err) {
                    reject(err)
                    return
                }

                var market = res.body.find((market) => {
                    return market.symbol == symbol
                })

                var minimumAmount = market.limits.amount.min
                var minimumCost = market.limits.cost.min
                var precisionAmount = market.precision.amount

                superagent
                    .get(`${path}/orderBook`)
                    .query({ symbol: symbol })
                    .set('Authorization', `Bearer ${token}`)
                    .end((err, res) => {
                        if (err) {
                            reject(err)
                            return
                        }

                        var farLevel = (side == 'buy' ? res.body.bids : res.body.asks)[10]

                        var price = farLevel.price
                        var computedAmount = parseFloat(((minimumCost / price) + Math.pow(10, -1 * precisionAmount)).toFixed(precisionAmount))
                        var amount = Math.max(minimumAmount, computedAmount)

                        var orderPlacement = { symbol: symbol, type: 'limit', side: side, amount:amount, price:price }
                        resolve(orderPlacement)
                    })
        })
    });
}

module.exports = {
    getUnattractiveOrderPlacement : getUnattractiveOrderPlacement
}