'use strict';

const ccxt = require('ccxt')
    , ccxtRestConfig = require('../config')
    , db = require('./../helpers/db')
    , fs = require('fs')
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
      res.status(404).send()
    }
}

function createExchange(req, res) {
    var exchangeName = req.swagger.params.exchangeName.value;

    if (ccxtRestConfig[exchangeName]) {
      res.status(503).send()
      return
    }

    var reqBody = req.body;

    if (ccxt[exchangeName]) {
      var exchange = new ccxt[exchangeName](reqBody);

      db.saveExchange(exchangeName, exchange);
      
      _renderExchange(exchange, res);
    } else {
      res.status(404).send()
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
  var symbol = req.swagger.params.symbol.value;
  var since = req.swagger.params.since.value;
  var limit = req.swagger.params.limit.value;
  var exchange = _getExchange(req)

  if (exchange) {
    exchange.fetchTrades(symbol, since, limit)
      .then((rawTrades) => {
        res.json(rawTrades.map(rawTrade => new exchange_response.TradeResponse(rawTrade)));
      }).catch((error) => {
        res.status(500).json();
        console.error(error);
      });
  } else {
    res.status(404).json();
  }
}

function ticker(req, res) {
  var symbol = req.swagger.params.symbol.value;
  var exchange = _getExchange(req)

  if (exchange) {
    exchange.fetchTicker(symbol)
      .then((rawTicker) => {
        res.json(new exchange_response.TickerResponse(rawTicker));
      }).catch((error) => {
        res.status(500).json();
        console.error(error);
      });
  } else {
    res.status(404).json();
  }
}

function balances(req, res) {
  var exchange = _getExchange(req)

  if (exchange) {
    exchange.fetchBalance()
      .then((rawBalance) => {
        res.json(new exchange_response.BalanceResponse(rawBalance));
      }).catch((error) => {
        res.status(500).json();
        console.error(error);
      });
  } else {
    res.status(404).json();
  }
}

function createOrder(req, res) {
  var exchange = _getExchange(req)

  if (exchange) {
    var orderPlacement = req.body;
    exchange.createOrder(orderPlacement.symbol, orderPlacement.type, orderPlacement.side, orderPlacement.amount, orderPlacement.price)
      .then((rawOrderPlacementResponse) => {
        var response = new exchange_response.OrderResponse(rawOrderPlacementResponse)
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
        res.json(response);
      }).catch((error) => {
        console.error(error);
        res.status(500).json();
      });
  } else {
    res.status(404).json();
  }
}

function cancelOrder(req, res) {
  var exchange = _getExchange(req)
  var orderId = req.swagger.params.orderId.value;
  var symbol = req.swagger.params.symbol.value;

  if (exchange) {
    exchange.cancelOrder(orderId, symbol)
      .then((rawOrderCancellationResponse) => {
        var response = new exchange_response.OrderResponse(rawOrderCancellationResponse)
        if (!response.id) {
          response.id = orderId
        }
        if (!response.symbol) {
          response.symbol = symbol
        }
        res.json(response);
      }).catch((error) => {
        console.error(error);
        res.status(500).json();
      });
  } else {
    res.status(404).json();
  }
}

function fetchOrder(req, res) {
  var exchange = _getExchange(req)
  var orderId = req.swagger.params.orderId.value;
  var symbol = req.swagger.params.symbol.value;

  if (exchange) {
    exchange.fetchOrder(orderId, symbol)
      .then((rawOrder) => {
        res.json(new exchange_response.OrderResponse(rawOrder));
      }).catch((error) => {
        console.error(error);
        res.status(500).json();
      });
  } else {
    res.status(404).json();
  }
}

function fetchOrders(req, res) {
  var exchange = _getExchange(req)
  var symbol = req.swagger.params.symbol.value;
  var since = req.swagger.params.since.value;
  var limit = req.swagger.params.limit.value;

  if (exchange) {
    if (!exchange.has.fetchOrders) {
      res.status(501).json();      
    } else {
      exchange.fetchOrders(symbol, since, limit)
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

function _execute(req, res, parameterNames, capabilityProperty, functionName, responseTransformer) {
  var exchange = _getExchange(req)
  const parameterValues = parameterNames.map(parameterName => req.swagger.params[parameterName].value)

  if (exchange) {
    if (capabilityProperty && !exchange.has[capabilityProperty]) {
      res.status(501).json();      
    } else {
      exchange[functionName].apply(exchange, parameterValues)
        .then(response => {
          res.json(responseTransformer(response));
        }).catch((error) => {
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
            let errorMessageSegments = []
            errorMessageSegments.push('[' + req.swagger.params.exchangeId.value + '] Error on ' + functionName)
            if (error.constructor && error.constructor.name) {
              errorMessageSegments.push(error.constructor.name)
            }
            errorMessageSegments.push(error)
            console.error(errorMessageSegments.join('\n'));
            res.status(500).json();
          }
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
