'use strict';

const db = require('../helpers/db')
    , ccxt = require('ccxt')
    , exchange_response = require('../models/exchange-response')


function logError(req, functionName, error) {
  let errorMessageSegments = []
  errorMessageSegments.push('[' + req.swagger.params.exchangeId.value + '] Error on ' + functionName)
  if (error.constructor && error.constructor.name) {
    errorMessageSegments.push(error.constructor.name)
  }
  errorMessageSegments.push(error)
  console.trace(errorMessageSegments.join('\n'));
}

function genericHandleError(res, label, error) {
    console.trace('Error in ' + label + '\n' + error)
    res.status(500).send()
}
  
function handleError(req, res, functionName, error) {
    logError(req, functionName, error)
    if (error instanceof ccxt.AuthenticationError) {
      res.status(401).send();
    } else if (error instanceof ccxt.InvalidNonce) {
      res.status(403).send();
    } else if (error instanceof ccxt.OrderNotFound) {
      res.status(404).send();
    } else if (error instanceof ccxt.InvalidOrder || error instanceof ccxt.InsufficientFunds) {
      res.status(400).send();
    } else if (error instanceof ccxt.NotSupported) {
      res.status(501).send();
    } else if (error instanceof ccxt.NetworkError) {
      res.status(504).send();
    } else {
      res.status(500).send();
    }
}
  
function execute(req, res, parameterNamesOrParameterValuesExtractor, functionName, responseTransformer) {
    try {
      let context = {}
  
      const exchange = getExchange(req)
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
  
      if (exchange) {
        if (exchange.has[functionName] === false) {
          console.error('[' + exchange.name + '] does not support ' + functionName)
          res.status(501).send();      
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
      } else {
        res.status(404).send();
      }
    } catch (error) {
      genericHandleError(res, functionName, error)
    }
}
  
function getExchange(req) {
    var exchangeName = req.swagger.params.exchangeName.value;
    var exchangeId = req.swagger.params.exchangeId.value;
  
    return db.getExchange(exchangeName, exchangeId);
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
    genericHandleError : genericHandleError, 
    getExchange : getExchange, 
    handleError : handleError,
    logError : logError,
    renderExchange : renderExchange
}