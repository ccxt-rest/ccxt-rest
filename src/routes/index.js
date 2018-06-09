var express = require('express');

module.exports = function(app) {
  var router = express.Router();

  app.use('/', router);

  /* GET home page. */
  router.get('/', function(req, res, next) {
    res.send(JSON.stringify({}));
  });

};
