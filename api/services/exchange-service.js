const ccxt = require('ccxt')
    , db = require('../models')
    , Flatted = require('flatted/cjs')
;

const exchangeCache = {}
        
function _createWhereClause(exchangeName, exchangeId) {
    return {
        where: {
          exchangeId: exchangeId,
          exchangeName : exchangeName
        }
    } 
}

function saveOrUpdate(exchangeName, exchangeId, constructorParameters, exchange) {
    exchangeCache[exchangeName] = exchangeCache[exchangeName] || {}
    exchangeCache[exchangeName][exchangeId] = exchange
    const params = Flatted.stringify(constructorParameters)
    return db.Exchange.create({exchangeName:exchangeName, exchangeId:exchangeId, params:params})
}

function destroy(exchangeName, exchangeId) {
    return findByExchangeNameAndExchangeId(exchangeName, exchangeId)
        .then(exchange => {
            return db.Exchange.destroy(_createWhereClause(exchangeName, exchangeId))
                .then(() => {
                    delete exchangeCache[exchangeName][exchangeId]
                    return exchange
                })
        });
}

async function getPublicExchange(exchangeName) {
    const existingPublicExchange = await findByExchangeNameAndExchangeId(exchangeName, '');
    
    if (existingPublicExchange) {
        existingPublicExchange.id = ''
        return existingPublicExchange
    } else {
        const params = {enableRateLimit:true}
        const newPublicExchange = new ccxt[exchangeName](params)
        newPublicExchange.id = ''
        await saveOrUpdate(exchangeName, '', params, newPublicExchange)
        return newPublicExchange
    }
}

async function findByExchangeNameAndExchangeId(exchangeName, exchangeId) {
    exchangeCache[exchangeName] = exchangeCache[exchangeName] || {}
    if (exchangeCache[exchangeName][exchangeId]) {
        return exchangeCache[exchangeName][exchangeId]
    } else {
        return db.Exchange.findOne(_createWhereClause(exchangeName, exchangeId))
            .then(exchangeData => {
                if (exchangeData) {
                    exchangeCache[exchangeName][exchangeId] = new ccxt[exchangeName](exchangeData.params.toString())
                    return exchangeCache[exchangeName][exchangeId]
                } else {
                    return null;
                }
            })
    }
}

module.exports = {
    findByExchangeNameAndExchangeId : findByExchangeNameAndExchangeId,
    destroy : destroy,
    getPublicExchange : getPublicExchange,
    saveOrUpdate : saveOrUpdate
}