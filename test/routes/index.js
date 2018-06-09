var parent = require('../');

module.exports = {
    src : function(path) {
        return './../' + parent.src(path);
    }
}