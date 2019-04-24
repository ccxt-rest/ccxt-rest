'use strict';

const ccxt = require('ccxt')
    , ccxtRestConfig = require('../config')
    , db = require('../helpers/db')
    , exchange_response = require('../models/exchange_response')
;

module.exports = {
  list: list,
  listIds: listIds,
  createExchange: createExchange,
  getOne : getOne,
  deleteExchange : deleteExchange,
  markets: markets,
  orderBook: orderBook,
  l2OrderBook: l2OrderBook,
  trades: trades,
  ticker: ticker,
  tickers: tickers,
  balances: balances,
  createOrder: createOrder,
  cancelOrder: cancelOrder,
  fetchOrder: fetchOrder,
  fetchOrders: fetchOrders,
  fetchOpenOrders: fetchOpenOrders,
  fetchClosedOrders: fetchClosedOrders,
  fetchMyTrades: fetchMyTrades,
  directCall: directCall
};

function list(req, res) {
  try {
    res.send(ccxt.exchanges)
  } catch (error) {
    console.error('Error in list\n' + error)
    res.status(500).send()
  }
}


function listIds(req, res) {
  try {
    const exchangeName = req.swagger.params.exchangeName.value;

    if (ccxt[exchangeName]) {
      const exchangeIds = db.getExchangeIds(exchangeName);
      res.send(exchangeIds);
    } else {
      res.status(404).send()
    }
  } catch(error) {
    _genericHandleError(res, 'listIds', error)
  }
}

function createExchange(req, res) {
  try {
    const exchangeName = req.swagger.params.exchangeName.value;

    if (ccxtRestConfig[exchangeName] && ccxtRestConfig[exchangeName].status == 'broken') {
      console.error('[' + exchangeName + '] is broken and not supported right now')
      res.status(503).send()
      return
    }

    const reqBody = req.body;

    if (ccxt[exchangeName]) {
      const override = ccxtRestConfig[exchangeName] && ccxtRestConfig[exchangeName].override || {};
      const ccxtParam = Object.assign(reqBody, override)
      const exchange = new ccxt[exchangeName](ccxtParam);

      db.saveExchange(exchangeName, exchange);
      
      _renderExchange(exchange, res);
    } else {
      res.status(404).send()
    }
  } catch (error) {
    _genericHandleError(res, 'createExchange', error)
  }
}

function getOne(req, res) {
  try {
    const exchange = _getExchange(req)

    _renderExchange(exchange, res);
  } catch (error) {
    _genericHandleError(res, 'getOne', error)
  }
}

function deleteExchange(req, res) {
  try {
    const exchangeName = req.swagger.params.exchangeName.value;
    const exchangeId = req.swagger.params.exchangeId.value;
  
    const exchange = db.deleteExchange(exchangeName, exchangeId);
    
    _renderExchange(exchange, res);  
  } catch (error) {
    _genericHandleError(res, 'deleteExchange', error)
  }
}

function markets(req, res) {
  _execute(req, res, 
    [], 
    'fetchMarkets', 
    (response) => response.map(rawMarket => new exchange_response.MarketResponse(rawMarket))
  )
}

function orderBook(req, res) {
  _execute(req, res, 
    ['symbol', 'limit'], 
    'fetchOrderBook', 
    (response) => new exchange_response.OrderBookResponse(response)
  )
}

function l2OrderBook(req, res) {
  _execute(req, res, 
    ['symbol', 'limit'], 
    'fetchL2OrderBook', 
    (response) => new exchange_response.OrderBookResponse(response)
  )
}

function trades(req, res) {
  _execute(req, res, 
    ['symbol', 'since', 'limit'], 
    'fetchTrades', 
    (response) => response.map(rawTrade => new exchange_response.TradeResponse(rawTrade))
  )
}

function ticker(req, res) {
  _execute(req, res, 
    ['symbol'], 
    'fetchTicker', 
    (response) => new exchange_response.TickerResponse(response)
  )
}

function tickers(req, res) {
  _execute(req, res, 
    ['symbol'], 
    'fetchTickers', 
    (response) => Object.keys(response).sort().map(symbol => new exchange_response.TickerResponse(response[symbol]))
  )
}

function balances(req, res) {
  _execute(req, res, 
    [], 
    'fetchBalance', 
    (response) => new exchange_response.BalanceResponse(response)
  )
}

function createOrder(req, res) {
  _execute(req, res, 
    (req, context) => {
      const orderPlacement = req.body;
      context.orderPlacement = orderPlacement
      const parameterValues = [orderPlacement.symbol, orderPlacement.type, orderPlacement.side, orderPlacement.amount, orderPlacement.price]
      return parameterValues
    }, 
    'createOrder', 
    (rawOrderPlacementResponse, context) => {
      const orderPlacement = context.orderPlacement
      let response = new exchange_response.OrderResponse(rawOrderPlacementResponse)
      if (!response.symbol) {
        response.symbol = orderPlacement.symbol
      }
      if (!response.type) {
        response.type = orderPlacement.type
      }
      if (!response.side) {
        response.side = orderPlacement.side
      }
      if (!response.amount) {
        response.amount = orderPlacement.amount
      }
      if (!response.price) {
        response.price = orderPlacement.price
      }
      return response
    }
  )
}

function cancelOrder(req, res) {
  _execute(req, res, 
    ['orderId', 'symbol'], 
    'cancelOrder', 
    (rawOrderCancellationResponse, context) => {
      var response = new exchange_response.OrderResponse(rawOrderCancellationResponse)
      if (!response.id) {
        response.id = context[0]
      }
      if (!response.symbol) {
        response.symbol = context[1]
      }
      return response
    }
  )
}

function fetchOrder(req, res) {
  _execute(req, res, 
    ['orderId', 'symbol'], 
    'fetchOrder', 
    (reponse) => new exchange_response.OrderResponse(reponse)
  )
}

function fetchOrders(req, res) {
  _execute(req, res, 
    ['symbol', 'since', 'limit'], 
    'fetchOrders', 
    (reponse) => reponse.map(rawOrder => new exchange_response.OrderResponse(rawOrder))
  )
}

function fetchOpenOrders(req, res) {
  _execute(req, res, 
    ['symbol', 'since', 'limit'], 
    'fetchOpenOrders', 
    (response) => response.map(rawOrder => new exchange_response.OrderResponse(rawOrder))
  )
}

function fetchClosedOrders(req, res) {
  _execute(req, res, 
    ['symbol', 'since', 'limit'], 
    'fetchClosedOrders', 
    (response) => response.map(rawOrder => new exchange_response.OrderResponse(rawOrder))
  )
}

function fetchMyTrades(req, res) {
  _execute(req, res, 
    ['symbol', 'since', 'limit'], 
    'fetchMyTrades', 
    (response) => response.map(rawTrade => new exchange_response.TradeResponse(rawTrade))
  )
}

function directCall(req, res) {
  var methodName = req.swagger.params.methodName.value;
  _execute(req, res, 
    (req) => req.body,
    methodName, 
    (response) => response
  )
}

function _logError(req, functionName, error) {
  let errorMessageSegments = []
  errorMessageSegments.push('[' + req.swagger.params.exchangeId.value + '] Error on ' + functionName)
  if (error.constructor && error.constructor.name) {
    errorMessageSegments.push(error.constructor.name)
  }
  errorMessageSegments.push(error)
  console.trace(errorMessageSegments.join('\n'));
}

function _genericHandleError(res, label, error) {
  console.trace('Error in ' + label + '\n' + error)
  res.status(500).send()
}

function _handleError(req, res, functionName, error) {
  _logError(req, functionName, error)
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

function _execute(req, res, parameterNamesOrParameterValuesExtractor, functionName, responseTransformer) {
  try {
    let context = {}

    const exchange = _getExchange(req)
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
              _handleError(req, res, functionName, error)
            }
          }).catch((error) => {
            _handleError(req, res, functionName, error)
          });
      }
    } else {
      res.status(404).send();
    }
  } catch (error) {
    _genericHandleError(res, functionName, error)
  }
}

function _getExchange(req) {
  var exchangeName = req.swagger.params.exchangeName.value;
  var exchangeId = req.swagger.params.exchangeId.value;

  return db.getExchange(exchangeName, exchangeId);
}

function _renderExchange(exchange, res) {
  if (exchange) {
    res.send(new exchange_response.ExchangeResponse(exchange));
  } else {
    res.status(404).send();
  }
}
