const ccxt = require('ccxt')
    , controller_helper = require('../helpers/controller-helper')
    , exchange_response = require('../dto/exchange-response')
    , ccxtRestErrors = require('../errors')
    , execute = controller_helper.execute
;

const UNSUPPORTED_EXCHANGES = {
}

let exchangeConfigs = {
    bitso: {
        override: {
            createPrivateConnection : (req, res, defaultBehaviour) => {
                req.body= Object.assign(req.body, {
                    has : {
                        fetchOrder: true
                    }
                  })
            
                defaultBehaviour(req, res)
            }
        }
    }
};

Object.keys(UNSUPPORTED_EXCHANGES).forEach(exchangeName => {
    exchangeConfigs[exchangeName] = {
        override : (functionName, req, res, defaultBehaviour) => {
            const details = UNSUPPORTED_EXCHANGES[exchangeName]
            const message = `[${exchangeName}] is currently ${details.status} and not supported right now (${details.moreInfo}).`
            throw new ccxtRestErrors.BrokenExchangeError(message)
        }
    }
})

module.exports = Object.assign(exchangeConfigs, {
    exchanges: ccxt.exchanges.filter(exchangeName => !UNSUPPORTED_EXCHANGES.hasOwnProperty(exchangeName)),
})