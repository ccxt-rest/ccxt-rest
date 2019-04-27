const ccxt = require('ccxt')
    , controller_helper = require('../helpers/controller-helper')
    , exchange_response = require('../models/exchange-response')
    , ccxtRestErrors = require('../errors')
    , execute = controller_helper.execute
;

module.exports = {
    allcoin: {
        override : (functionName, req, res, defaultBehaviour) => {
            throw new ccxtRestErrors.BrokenExchangeError('[allcoin] is broken and not supported right now')
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