'use strict';

const SwaggerExpress = require('swagger-express-mw');
const SwaggerUi = require('swagger-tools/middleware/swagger-ui');

const express = require('express')
const app = express();
module.exports = app; // for testing

var config = {
  appRoot: __dirname // required config
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  app.use(SwaggerUi(swaggerExpress.runner.swagger, {swaggerUi:'/explorer'}));

  // install middleware
  swaggerExpress.register(app);

  app.use('/', express.static(__dirname + '/./out/docs'))

  var port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    console.info('Starting up 0.0.0.0:', server.address().port);
  });

});
