const ccxt = require('ccxt')
    , controller_helper = require('../helpers/controller-helper')
    , exchange_response = require('../models/exchange-response')
    , execute = controller_helper.execute
;

module.exports = {
    allcoin: {
        override : {
            createExchange : (req, res) => {
                console.error('[allcoin] is broken and not supported right now')
                res.status(503).send()
            }
        }
    }, 
    bitso: {
        override: {
            createExchange : (req, res, defaultBehaviour) => {
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