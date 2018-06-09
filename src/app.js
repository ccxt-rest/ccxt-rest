var express = require('express');
var logger = require('morgan');
var ccxt = require ('ccxt');

var appConfig = require('./app-config');
var indexRouter = require('./routes/index');
var exchangesRouter = require('./routes/exchanges');

var app = express();

app.use(logger('dev'));

appConfig.setupRouters(app, function(app) {
  indexRouter(app);
  exchangesRouter(app);
});

module.exports = app;

app.set('port', process.env.PORT || 3000);