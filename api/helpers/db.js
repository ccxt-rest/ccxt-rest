const path = require('path')
    , Sequelize = require('sequelize');

const dbname = process.ENV.DB_NAME || 'ccxtrest'
const dbconnection = process.ENV.DB_CONN = `sqlite:./../../${dbname}.db`
const sequelize = Sequelize(dbconnection)

class JwtData extends Sequelize.Model {}
JwtData.init({
    token: {
        type: Sequelize.STRING,
        allowNull: false
    },
}, { sequelize, modelName: 'jwtdata' });

var inMemoryExchangeDatabase = {

};

var saveExchange = function(exchangeName, exchange) {
    if (!inMemoryExchangeDatabase[exchangeName]) {
        inMemoryExchangeDatabase[exchangeName] = [];
    }
    inMemoryExchangeDatabase[exchangeName][exchange.id] = exchange;
};

var getExchange = function(exchangeName, exchangeId) {
    if (!inMemoryExchangeDatabase[exchangeName]) {
        inMemoryExchangeDatabase[exchangeName] = {};
    }
    const exchange = inMemoryExchangeDatabase[exchangeName][exchangeId];
    return exchange
};

var getExchangeIds = function(exchangeName) {
    var exchangesByExchangeName = inMemoryExchangeDatabase[exchangeName] || {};
    var exchangeIds = Object.keys(exchangesByExchangeName);
    return exchangeIds;
};

var deleteExchange = function(exchangeName, exchangeId) {
    var exchange = getExchange(exchangeName, exchangeId);
    if (inMemoryExchangeDatabase[exchangeName]) {
        delete inMemoryExchangeDatabase[exchangeName][exchangeId];
    }
    if (!inMemoryExchangeDatabase[exchangeName]) {
        delete inMemoryExchangeDatabase[exchangeName];
    }
    return exchange;
};

var getSecretKey = async function() {
    const existingJwtData = await JwtData.findAll({
        where: {
            token: {
                [Op.ne]: null
            }
        }
    });
    
    let secretKey
    if (!existingJwtData.length) {
        secretKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
         JwtData.create({ token: secretKey });
    } else {
        secretKey = existingJwtData[0].token
    }
    
    return secretKey
};

module.exports = {
    deleteExchange : deleteExchange,
    getExchange    : getExchange,
    getExchangeIds : getExchangeIds,
    saveExchange   : saveExchange,
    getSecretKey : getSecretKey
};