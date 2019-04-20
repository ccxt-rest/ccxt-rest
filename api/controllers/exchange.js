'use strict';

const ccxt = require('ccxt')
    , ccxtRestConfig = require('../config')
    , db = require('./../helpers/db')
    , exchange_response = require('../models/exchange_response')
;

module.exports = {
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

function listIds(req, res) {
    var exchangeName = req.swagger.params.exchangeName.value;

    if (ccxt[exchangeName]) {
      var exchangeIds = db.getExchangeIds(exchangeName);
      res.json(exchangeIds);
    } else {
      res.status(404).json()
    }
}

function createExchange(req, res) {
    var exchangeName = req.swagger.params.exchangeName.value;

    if (ccxtRestConfig[exchangeName] && ccxtRestConfig[exchangeName].status == 'broken') {
      res.status(503).json()
      return
    }

    var reqBody = req.body;

    if (ccxt[exchangeName]) {
      const override = ccxtRestConfig[exchangeName] && ccxtRestConfig[exchangeName].override || {};
      const ccxtParam = Object.assign(reqBody, override)
      var exchange = new ccxt[exchangeName](ccxtParam);

      db.saveExchange(exchangeName, exchange);
      
      _renderExchange(exchange, res);
    } else {
      res.status(404).json()
    }
}

function getOne(req, res) {
  var exchange = _getExchange(req)

  _renderExchange(exchange, res);
}

function deleteExchange(req, res) {
  var exchangeName = req.swagger.params.exchangeName.value;
  var exchangeId = req.swagger.params.exchangeId.value;

  var exchange = db.deleteExchange(exchangeName, exchangeId);
  
  _renderExchange(exchange, res);
}

function markets(req, res) {
  _execute(req, res, 
    [], 
    'fetchMarkets', 
    'fetchMarkets', 
    (response) => response.map(rawMarket => new exchange_response.MarketResponse(rawMarket))
  )
}

function orderBook(req, res) {
  _execute(req, res, 
    ['symbol', 'limit'], 
    'fetchOrderBook', 
    'fetchOrderBook', 
    (response) => new exchange_response.OrderBookResponse(response)
  )
}

function l2OrderBook(req, res) {
  _execute(req, res, 
    ['symbol', 'limit'], 
    'fetchL2OrderBook', 
    'fetchL2OrderBook', 
    (response) => new exchange_response.OrderBookResponse(response)
  )
}

function trades(req, res) {
  _execute(req, res, 
    ['symbol', 'since', 'limit'], 
    'fetchTrades', 
    'fetchTrades', 
    (response) => response.map(rawTrade => new exchange_response.TradeResponse(rawTrade))
  )
}

function ticker(req, res) {
  _execute(req, res, 
    ['symbol'], 
    'fetchTicker', 
    'fetchTicker', 
    (response) => new exchange_response.TickerResponse(response)
  )
}

function tickers(req, res) {
  _execute(req, res, 
    ['symbol'], 
    'fetchTickers', 
    'fetchTickers', 
    (response) => Object.keys(response).sort().map(symbol => new exchange_response.TickerResponse(response[symbol]))
  )
}

function balances(req, res) {
  _execute(req, res, 
    [], 
    'fetchBalance', 
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
    'fetchOrder', 
    (reponse) => new exchange_response.OrderResponse(reponse)
  )
}

function fetchOrders(req, res) {
  _execute(req, res, 
    ['symbol', 'since', 'limit'], 
    'fetchOrders', 
    'fetchOrders', 
    (reponse) => reponse.map(rawOrder => new exchange_response.OrderResponse(rawOrder))
  )
}

function fetchOpenOrders(req, res) {
  var exchange = _getExchange(req)
  var symbol = req.swagger.params.symbol.value;
  var since = req.swagger.params.since.value;
  var limit = req.swagger.params.limit.value;

  if (exchange) {
    exchange.fetchOpenOrders(symbol, since, limit)
      .then((rawOrders) => {
        res.json(rawOrders.map(rawOrder => new exchange_response.OrderResponse(rawOrder)));
      }).catch((error) => {
        console.error(error);
        res.status(500).json();
      });
  } else {
    res.status(404).json();
  }
}

function fetchClosedOrders(req, res) {
  var exchange = _getExchange(req)
  var symbol = req.swagger.params.symbol.value;
  var since = req.swagger.params.since.value;
  var limit = req.swagger.params.limit.value;

  if (exchange) {
    if (!exchange.has.fetchClosedOrders) {
      res.status(501).json();      
    } else {
      exchange.fetchClosedOrders(symbol, since, limit)
        .then((rawOrders) => {
          res.json(rawOrders.map(rawOrder => new exchange_response.OrderResponse(rawOrder)));
        }).catch((error) => {
          console.error(error);
          res.status(500).json();
        });
    }
  } else {
    res.status(404).json();
  }
}

function fetchMyTrades(req, res) {
  var exchange = _getExchange(req)
  var symbol = req.swagger.params.symbol.value;
  var since = req.swagger.params.since.value;
  var limit = req.swagger.params.limit.value;

  if (exchange) {
    if (!exchange.has.fetchMyTrades) {
      res.status(501).json();      
    } else {
      exchange.fetchMyTrades(symbol, since, limit)
        .then((rawTrades) => {
          res.json(rawTrades.map(rawTrade => new exchange_response.TradeResponse(rawTrade)));
        }).catch((error) => {
          console.error(error);
          res.status(500).json();
        });
    }
  } else {
    res.status(404).json();
  }
}

function directCall(req, res) {
  var methodName = req.swagger.params.methodName.value;
  var methodParameters;
  try {
    methodParameters = JSON.parse(req.body);
  } catch(e) {
    methodParameters = [];
  }
  var exchange = _getExchange(req)

  if (exchange) {
    exchange[methodName].apply(exchange, methodParameters)
      .then((response) => {
        res.json(response);
      }).catch((error) => {
        res.status(500).json();
        console.error(error);
      });
  } else {
    res.status(404).json();
  }
}

function _handleError(req, res, functionName, error) {
  if (error instanceof ccxt.AuthenticationError) {
    res.status(401).json();
  } else if (error instanceof ccxt.InvalidNonce) {
    res.status(403).json();
  } else if (error instanceof ccxt.OrderNotFound) {
    res.status(404).json();
  } else if (error instanceof ccxt.InvalidOrder || error instanceof ccxt.InsufficientFunds) {
    res.status(400).json();
  } else if (error instanceof ccxt.NotSupported) {
    res.status(501).json();
  } else if (error instanceof ccxt.NetworkError) {
    res.status(598).json();
  } else {
    console.error()
    let errorMessageSegments = []
    errorMessageSegments.push('[' + req.swagger.params.exchangeId.value + '] Error on ' + functionName)
    if (error.constructor && error.constructor.name) {
      errorMessageSegments.push(error.constructor.name)
    }
    errorMessageSegments.push(error)
    console.error(errorMessageSegments.join('\n'));
    res.status(500).json();
  }
}

function _execute(req, res, parameterNamesOrParameterValuesExtractor, capabilityProperty, functionName, responseTransformer) {
  let context = {}
  var exchange = _getExchange(req)
  const parameterValues = typeof(parameterNamesOrParameterValuesExtractor) === 'function' ? 
    parameterNamesOrParameterValuesExtractor(req, context) : 
    parameterNamesOrParameterValuesExtractor.map(parameterName => req.swagger.params[parameterName].value)
  context.parameterValues = parameterValues

  if (exchange) {
    if (capabilityProperty && !exchange.has[capabilityProperty]) {
      res.status(501).json();      
    } else {
      exchange[functionName].apply(exchange, parameterValues)
        .then(response => {
          try {
            res.json(responseTransformer(response, context));
          } catch (error) {
            _handleError(req, res, functionName, error)
          }
        }).catch((error) => {
          _handleError(req, res, functionName, error)
        });
    }
  } else {
    res.status(404).json();
  }
}

function _getExchange(req) {
  var exchangeName = req.swagger.params.exchangeName.value;
  var exchangeId = req.swagger.params.exchangeId.value;

  return db.getExchange(exchangeName, exchangeId);
}

function _renderExchange(exchange, res) {
  if (exchange) {
    res.json(new exchange_response.ExchangeResponse(exchange));
  } else {
    res.status(404).json();
  }
}
