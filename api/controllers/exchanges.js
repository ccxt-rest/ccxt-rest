'use strict';
var ccxt = require ('ccxt');

module.exports = {
  list: list
};

function list(req, res) {
  res.json(ccxt.exchanges)
}
