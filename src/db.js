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
        inMemoryExchangeDatabase[exchangeName] = [];
    }
    return inMemoryExchangeDatabase[exchangeName][exchangeId];
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

module.exports = {
    saveExchange   : saveExchange,
    getExchange    : getExchange,
    getExchangeIds : getExchangeIds,
    deleteExchange : deleteExchange
};