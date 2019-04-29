const homedir = require('os').homedir();

module.exports = {
  "development": {
    "dialect": "sqlite",
    "storage": "./database.sqlite3"
  },
  "test": {
    "dialect": "sqlite",
    "storage": "./out/database.sqlite3"
  },
  "production": {
    "dialect": "sqlite",
    "storage": `${homedir}/.ccxt-rest/database.sqlite3`
  }
}