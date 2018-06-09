var express = require('express');

var preRouters = function(app) {
    app.use(express.json({
      type: function() {
          return true;
      }
    }));
    app.use(express.urlencoded({ extended: false }));
    
    // set default content-type
    app.use(function (req, res, next) {  
      res.header('Content-Type','application/json');
      next();
    });

};

var postRouters = function(app) {
    // error handler
    app.use(function(err, req, res, next) {
        var error = req.app.get('env') === 'development' ? err : {};
    
        // render the error page
        res.status(err.status || 500);
        res.send(JSON.stringify({
            status:err.status,
            message:err.message,
            error:error
        }));
    });
};

var setupRouters = function(app, callback) {
    preRouters(app);
    callback(app);
    postRouters(app);
};

module.exports = {
    preRouters : preRouters,
    postRouters : postRouters,
    setupRouters : setupRouters
};
