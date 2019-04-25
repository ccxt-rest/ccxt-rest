'use strict';

const db = require('../helpers/db')
    , ccxt = require('ccxt')
    , jwt = require('jsonwebtoken')
    , exchange_response = require('../models/exchange-response')
    , ccxtRestErrors = require('../errors')
    , jwtHelper = require('./jwt-helper')
;


function handleError(req, res, label, error) {
    let exchangeId;
    try {
      exchangeId = getExchangeId(req)
    } catch (error) {
      exchangeId = '???invalid_token???'
    }
    console.error(`[${exchangeId}] Error on ${label}`);
    console.trace(error)
    if (error instanceof ccxt.AuthenticationError) {
      res.status(401).send();
    } else if (error instanceof ccxt.InvalidNonce || error instanceof ccxtRestErrors.AuthError) {
      res.status(403).send();
    } else if (error instanceof ccxt.OrderNotFound || error instanceof ccxtRestErrors.UnknownExchangeNameError) {
      res.status(404).send();
    } else if (error instanceof ccxt.InvalidOrder || error instanceof ccxt.InsufficientFunds) {
      res.status(400).send();
    } else if (error instanceof ccxt.NotSupported || error instanceof ccxtRestErrors.UnsupportedApiError) {
      res.status(501).send();
    } else if (error instanceof ccxtRestErrors.BrokenExchangeError) {
      res.status(503).send();
    } else if (error instanceof ccxt.NetworkError) {
      res.status(504).send();
    } else {
      res.status(500).send();
    }
}
  
function execute(req, res, parameterNamesOrParameterValuesExtractor, functionName, responseTransformer) {
    try {
      let context = {}
  
      const exchange = getExchangeFromRequest(req)
      let parameterValues
      if (typeof(parameterNamesOrParameterValuesExtractor) === 'function') {
        parameterValues = parameterNamesOrParameterValuesExtractor(req, context)
      } else {
        parameterValues = parameterNamesOrParameterValuesExtractor.map(parameterName => req.swagger.params[parameterName].value)
  
        // extract exchange-specific params
        let params = Object.assign({}, req.query)
        parameterNamesOrParameterValuesExtractor.forEach(paramName => {
          delete params[paramName]
        })
  
        // add exchange-specific params to parameterValues
        parameterValues.push(params)
      }
      context.parameterValues = parameterValues
  
      if (exchange.has[functionName] === false) {
        console.error(`[${exchange.name}] does not support ${functionName}`)
        throw new ccxtRestErrors.UnsupportedApiError(`${exchange.name}#${functionName} is not supported`)
      } else {
        exchange[functionName].apply(exchange, parameterValues)
          .then(response => {
            try {
              res.send(responseTransformer(response, context));
            } catch (error) {
              handleError(req, res, functionName, error)
            }
          }).catch((error) => {
            handleError(req, res, functionName, error)
          });
      }
    } catch (error) {
      handleError(req, res, functionName, error)
    }
}
  
function getExchangeFromRequest(req) {
    let exchangeName = getExchangeName(req)
    let exchangeId = getExchangeId(req)
    let exchange
    if (exchangeId) {
      exchange = db.getExchange(exchangeName, exchangeId);
    } else {
      exchange = getPublicExchange(exchangeName)
    }
    return exchange
}

function getExchangeName(req) {
  const exchangeName = req.swagger.params.exchangeName && req.swagger.params.exchangeName.value;
  if (!ccxt[exchangeName]) {
    throw new ccxtRestErrors.UnknownExchangeNameError(`${exchangeName} is not supported`)
  } else {
    return exchangeName;
  }
}

function getExchangeId(req) {
  if (req.headers && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    let token = req.headers.authorization.split('Bearer ')[1]
    let decoded = jwtHelper.decode(token)
    
    return decoded.sub
  }
  return null
}

var getPublicExchange = function(exchangeName) {
  const existingPublicExchange = db.getExchange(exchangeName, '');
  if (existingPublicExchange) {
      existingPublicExchange.id = ''
      return existingPublicExchange
  } else {
      const newPublicExchange = new ccxt[exchangeName]({enableRateLimit:true})
      newPublicExchange.id = ''
      db.saveExchange(exchangeName, newPublicExchange);
      return newPublicExchange
  }
}

function renderExchange(exchange, res) {
    if (exchange) {
      res.send(new exchange_response.ExchangeResponse(exchange));
    } else {
      res.status(404).send();
    }
}

module.exports = {
    execute : execute,
    getExchangeFromRequest : getExchangeFromRequest, 
    getExchangeId : getExchangeId,
    getExchangeName : getExchangeName,
    handleError : handleError,
    renderExchange : renderExchange
}