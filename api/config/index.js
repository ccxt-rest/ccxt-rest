const ccxt = require('ccxt')
    , controller_helper = require('../helpers/controller-helper')
    , exchange_response = require('../models/exchange-response')
    , ccxtRestErrors = require('../errors')
    , execute = controller_helper.execute
;

module.exports = {
    allcoin: {
        override : (functionName, req, res, defaultBehaviour) => {
            const message = '[allcoin] is currently broken and not supported right now (https://github.com/ccxt/ccxt/issues/2962).'
            throw new ccxtRestErrors.BrokenExchangeError(message)
        }
    }, 
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