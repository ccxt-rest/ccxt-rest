class ExchangeResponse {
    constructor(config) {
        config = config || {};
        config.has = config.has || {};

        this.name = config.name;
        this.enableRateLimit = config.enableRateLimit;
        this.countries = config.countries; 
        this.rateLimit = config.rateLimit
        this.twofa = config.twofa
        this.has = {};
        Object.keys(config.has).forEach((key,index) => {
            this.has[key] = '' + config.has[key]
        });
        this.urls = config.urls;
    }
}

class Fees {
    constructor(config) {
        config = config || {};
        config.funding = config.funding || {} 

        this.trading = new Fee(config.trading)
        this.funding = {
            withdraw : new Fee(config.funding.withdraw),
            deposit : new Fee(config.funding.deposit)
        }
    }
}

class Fee {
    constructor(config) {
        config = config || {};

        this.type = config.type; // 'taker' or 'maker'
        this.currency = config.currency;
        this.rate = config.rate;
        this.cost = config.cost;
    }
}

class MarketResponse {
    constructor(config) {
        config = config || {};
        config.limits = config.limits || {};

        this.id = config.id;
        this.symbol = config.symbol;
        this.base = config.base;
        this.quote = config.quote;
        this.info = config.info;
        this.lot = config.lot;
        this.limits = {};
        this.limits.amount = new Limit(config.limits.amount);
        this.limits.price = new Limit(config.limits.price);
        this.limits.cost = new Limit(config.limits.cost);
        this.precision = new Precision(config.precision);
    }
}

class Limit {
    constructor(config) {
        config = config || {};
        this.min = config.min;
        this.max = config.max;
    }
}

class Precision {
    constructor(config) {
        config = config || {};
        this.amount = config.amount;
        this.price = config.price;
    }
}

class OrderBookResponse {
    constructor(config) {
        config = config || {};
        this.bids = (config.bids || []).map(entry => new OrderBookLevel(entry))
        this.asks = (config.asks || []).map(entry => new OrderBookLevel(entry))
        this.timestamp = config.timestamp;
        this.datetime = config.datetime;
    }
}

class OrderBookLevel {
    constructor(config) {
        config = config || []
        if (config.length >= 1) {
            this.price = config[0];
        }
        if (config.length >= 2) {
            this.amount = config[1];
        }
    }
}

class TradeResponse {
    constructor(config) {
        config = config || {};
        this.id = config.id;
        this.info = config.info;
        this.timestamp = config.timestamp;
        this.datetime = config.datetime;
        this.symbol = config.symbol;
        this.side = config.side;
        this.price = config.price;
        this.amount = config.amount;
    }
}

class TickerResponse {
    constructor(config) {
        config = config || {};
        this.symbol = config.symbol;
        this.timestamp = config.timestamp;
        this.datetime = config.datetime;
        this.high = config.high ;
        this.low = config.low;
        this.bid = config.bid;
        this.ask = config.ask;
        this.vwap = config.vwap;
        this.close = config.close;
        this.last = config.last;
        this.baseVolume = config.baseVolume;
        this.quoteVolume = config.quoteVolume;
        this.info = config.info;
    }
}

class BalanceResponse {
    constructor(config) {
        config = config || {};
        this.info = config.info;
        this.balances = [];

        Object.keys(config).forEach((key, index) => {
            if (['info', 'free', 'used', 'total'].indexOf(key) == -1) {
                this.balances.push(new BalanceInfo(key, config[key]));
            }
        });
    }
}

class BalanceInfo {
    constructor(currency, config) {
        config = config || {};
        this.currency = currency;
        this.free = config.free;
        this.used = config.used;
        this.total = config.total;
    }
}

class OrderResponse {
    constructor(config) {
        config = config || {};
        this.id = config.id;
        this.timestamp = config.timestamp;
        this.datetime = config.datetime;
        this.symbol = config.symbol;
        this.type = config.type;
        this.side = config.side;
        this.price = config.price;
        this.amount = config.amount;
        this.cost = config.cost;
        this.filled = config.filled;
        this.remaining = config.remaining;
        this.status = config.status;
        this.info = config.info;
    }
}

module.exports = {
    ExchangeResponse: ExchangeResponse,
    MarketResponse: MarketResponse,
    OrderBookResponse: OrderBookResponse,
    TradeResponse: TradeResponse,
    TickerResponse: TickerResponse,
    BalanceResponse: BalanceResponse,
    OrderResponse: OrderResponse
};