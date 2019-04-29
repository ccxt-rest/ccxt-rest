'use strict';

const db = require('./api/models')
  , config = require('./api/config')
  , fs = require('fs')
  , http = require('http')
  , jwtHelper = require('./api/helpers/jwt-helper')
  , path = require('path')
;

var express = require("express");
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json({
  strict: false
}));
var oasTools = require('oas-tools');
var jsyaml = require('js-yaml');
var serverPort = config.port;

var spec = fs.readFileSync(path.join(__dirname, '/api/swagger/swagger.yaml'), 'utf8');
var oasDoc = jsyaml.safeLoad(spec);

var options_object = {
  controllers: path.join(__dirname, './api/controllers'),
  loglevel: config.logLevel,
  strict: false,
  router: true,
  validator: true,
  docs: {
    apiDocs: '/api-docs',
    apiDocsPrefix: '',
    swaggerUi: '/explorer',
    swaggerUiPrefix: ''
  }
};

oasTools.configure(options_object);

const SECS_IN_MS = 1000
const MINS_IN_MS = SECS_IN_MS*60
const HOURS_IN_MS = MINS_IN_MS*60
const DAYS_IN_MS = HOURS_IN_MS*24

var startTime = new Date()
app.use('/', express.static(__dirname + '/./out/docs'))
app.use('/info', function(req, res) {
  var currentTime = new Date()
  var elapsedTime = currentTime.getTime() - startTime.getTime()
  var elapsedDays = Math.round(elapsedTime / DAYS_IN_MS)
  var elapsedHours = Math.round((elapsedTime % DAYS_IN_MS) / HOURS_IN_MS)
  var elapsedMinutes = Math.round((elapsedTime % HOURS_IN_MS) / MINS_IN_MS)
  var elapsedSeconds = Math.round((elapsedTime % MINS_IN_MS) / SECS_IN_MS)
  res.send({
    "startTime" : startTime,
    "currentTime" : currentTime,
    "uptime" : {
      "days" : elapsedDays,
      "hours" : elapsedHours,
      "minutes" : elapsedMinutes,
      "seconds" : elapsedSeconds
    }
  })
})

var server
function start(callback) {
  db.migrate()
    .then(() => {
      jwtHelper.initialize()
        .then(() => {
          oasTools.initialize(oasDoc, app, function() {
            server = http.createServer(app);
            server.listen(serverPort, function() {
              console.log("App running at http://localhost:" + server.address().port);
              console.log("________________________________________________________________");
              if (options_object.docs !== false) {
                console.log('API docs (Swagger UI) available on http://localhost:' + server.address().port + '/explorer');
                console.log("________________________________________________________________");
              }
              if (callback) {
                console.log('Server started. Invoking callback')
                callback(server);
              }
            });
          });
        })
    })
}


// for testing
module.exports = {
  start: start
} 