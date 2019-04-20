'use strict';
var ccxt = require ('ccxt');

module.exports = {
  list: list
};

function list(req, res) {
  try {
    res.json(ccxt.exchanges)
  } catch (error) {
    console.error('Error in list\n' + error)
    res.status(500).json()
  }
}
