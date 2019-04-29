const homedir = require('os').homedir();

module.exports = {
    "dialect": "sqlite",
    "storage": `${homedir}/.ccxt-rest/database.sqlite3`
}