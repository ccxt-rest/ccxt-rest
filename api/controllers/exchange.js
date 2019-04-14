'use strict';

var ccxt = require('ccxt')
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
      res.status(404).json({});
    }
}

function createExchange(req, res) {
    var exchangeName = req.swagger.params.exchangeName.value;
    var reqBody = req.body;

    var exchange = new ccxt[exchangeName](reqBody);

    db.saveExchange(exchangeName, exchange);
    
    _renderExchange(exchange, res);
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
  var exchange = _getExchange(req)

  if (exchange) {
    exchange.fetchMarkets()
      .then((rawMarkets) => {
        var markets = rawMarkets.map(rawMarket => new exchange_response.MarketResponse(rawMarket))
        res.json(markets)
      }).catch((error) => {
        res.status(500).json({});
        console.error(error);
      });
  } else {
    res.status(404).json({});
  }
}

function orderBook(req, res) {
  var symbol = req.swagger.params.symbol.value;
  var limit = req.swagger.params.limit.value;
  var exchange = _getExchange(req)

  if (exchange) {
    exchange.fetchOrderBook(symbol, limit)
      .then((rawOrderBook) => {
        res.json(new exchange_response.OrderBookResponse(rawOrderBook));
      }).catch((error) => {
        res.status(500).json({});
        console.error(error);
      });
  } else {
    res.status(404).json({});
  }
}

function l2OrderBook(req, res) {
  var symbol = req.swagger.params.symbol.value;
  var limit = req.swagger.params.limit.value;
  var exchange = _getExchange(req)

  if (exchange) {
    exchange.fetchL2OrderBook(symbol, limit)
      .then((rawOrderBook) => {
        res.json(new exchange_response.OrderBookResponse(rawOrderBook));
      }).catch((error) => {
        res.status(500).json({});
        console.error(error);
      });
  } else {
    res.status(404).json({});
  }
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
        res.status(500).json({});
        console.error(error);
      });
  } else {
    res.status(404).json({});
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
        res.status(500).json({});
        console.error(error);
      });
  } else {
    res.status(404).json({});
  }
}

function balances(req, res) {
  var exchange = _getExchange(req)

  if (exchange) {
    exchange.fetchBalance()
      .then((rawBalance) => {
        res.json(new exchange_response.BalanceResponse(rawBalance));
      }).catch((error) => {
        res.status(500).json({});
        console.error(error);
      });
  } else {
    res.status(404).json({});
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
        res.status(500).json({});
      });
  } else {
    res.status(404).json({});
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
        res.status(500).json({});
      });
  } else {
    res.status(404).json({});
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
        res.status(500).json({});
      });
  } else {
    res.status(404).json({});
  }
}

function fetchOrders(req, res) {
  var exchange = _getExchange(req)
  var symbol = req.swagger.params.symbol.value;
  var since = req.swagger.params.since.value;
  var limit = req.swagger.params.limit.value;

  if (exchange) {
    exchange.fetchOrders(symbol, since, limit)
      .then((rawOrders) => {
        res.json(rawOrders.map(rawOrder => new exchange_response.OrderResponse(rawOrder)));
      }).catch((error) => {
        console.error(error);
        res.status(500).json({});
      });
  } else {
    res.status(404).json({});
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
        res.status(500).json({});
      });
  } else {
    res.status(404).json({});
  }
}

function fetchClosedOrders(req, res) {
  var exchange = _getExchange(req)
  var symbol = req.swagger.params.symbol.value;
  var since = req.swagger.params.since.value;
  var limit = req.swagger.params.limit.value;

  if (exchange) {
    exchange.fetchClosedOrders(symbol, since, limit)
      .then((rawOrders) => {
        res.json(rawOrders.map(rawOrder => new exchange_response.OrderResponse(rawOrder)));
      }).catch((error) => {
        console.error(error);
        res.status(500).json({});
      });
  } else {
    res.status(404).json({});
  }
}

function fetchMyTrades(req, res) {
  var exchange = _getExchange(req)
  var symbol = req.swagger.params.symbol.value;
  var since = req.swagger.params.since.value;
  var limit = req.swagger.params.limit.value;

  if (exchange) {
    exchange.fetchMyTrades(symbol, since, limit)
      .then((rawTrades) => {
        res.json(rawTrades.map(rawTrade => new exchange_response.TradeResponse(rawTrade)));
      }).catch((error) => {
        console.error(error);
        res.status(500).json({});
      });
  } else {
    res.status(404).json({});
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
        res.status(500).json({});
        console.error(error);
      });
  } else {
    res.status(404).json({});
  }
}

// from https://strongloop.github.io/strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators/#using-es7-asyncawait
let _wrap = fn => (...args) => fn(...args).catch(args[2])

function _getExchange(req) {
  var exchangeName = req.swagger.params.exchangeName.value;
  var exchangeId = req.swagger.params.exchangeId.value;

  return db.getExchange(exchangeName, exchangeId);
}

function _renderExchange(exchange, res) {
  if (exchange) {
    res.json(new exchange_response.ExchangeResponse(exchange));
  } else {
    res.status(404).json({});
  }
}
