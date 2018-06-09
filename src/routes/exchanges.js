var ccxt = require ('ccxt')
  , db = require('./../db')
  , express = require('express');

module.exports =  function(app) {
  var router = express.Router();

  app.use('/exchanges', router);

  // from https://strongloop.github.io/strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators/#using-es7-asyncawait
  let wrap = fn => (...args) => fn(...args).catch(args[2])

  router.get('/', function(req, res, next) {
    res.send(JSON.stringify(ccxt.exchanges));
  });

  router.get('/:exchangeName', function(req, res, next) {
    var exchangeName = req.params.exchangeName;
    var exchangeIds = db.getExchangeIds(exchangeName);
    res.send(JSON.stringify(exchangeIds));
  });

  router.post('/:exchangeName', function(req, res, next) {
    var reqBody = req.body;
    var exchangeName = req.params.exchangeName;

    var exchange = new ccxt[exchangeName](reqBody);
    db.saveExchange(exchangeName, exchange);
    
    res.send(JSON.stringify(exchange));
  });

  router.get('/:exchangeName/:exchangeId', function(req, res, next) {
    var exchangeName = req.params.exchangeName;
    var exchangeId = req.params.exchangeId
    var exchange = db.getExchange(exchangeName, exchangeId);
    if (exchange) {
      res.send(JSON.stringify(exchange));
    } else {
      res.sendStatus(404);
    }
    
  });

  router.delete('/:exchangeName/:exchangeId', function(req, res, next) {
    var exchangeName = req.params.exchangeName;
    var exchangeId = req.params.exchangeId

    var exchange = db.deleteExchange(exchangeName, exchangeId);
    
    if (exchange) {
      res.send(JSON.stringify(exchange));
    } else {
      res.sendStatus(404);
    }
  });

  router.post('/:exchangeName/:exchangeId/:methodName', wrap(async function(req, res) {
    var exchangeName = req.params.exchangeName;
    var exchangeId = req.params.exchangeId
    var methodName = req.params.methodName
    var reqBody = req.body;
    
    var exchange = db.getExchange(exchangeName, exchangeId);

    if (!exchange) {
      res.sendStatus(404);
      return;
    }

    var response = await exchange[methodName].apply(exchange, reqBody);
    res.send(JSON.stringify(response));
  }));
}
