'use strict';

var SwaggerExpress = require('swagger-express-mw');

const express = require('express')
var app = express();
module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  const router = express.Router();
  router.get('/', (req, res) => {
    res.redirect('/docs');
  })
  app.use('/', express.static('out/docs'))
  
  var port = process.env.PORT || 3000;
  console.log('Starting up 0.0.0.0:' + port)
  app.listen(port);

});
