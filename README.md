# CCXT REST

[![Build Status](https://travis-ci.org/franz-see/ccxt-rest.svg)](https://travis-ci.org/franz-see/ccxt-rest)
[![npm](https://img.shields.io/npm/v/ccxt-rest.svg)](https://npmjs.com/package/ccxt-rest)
[![NPM Downloads](https://img.shields.io/npm/dm/ccxt-rest.svg)](https://www.npmjs.com/package/ccxt-rest)
[![Docker Pulls](https://img.shields.io/docker/pulls/franzsee/ccxt-rest.svg)](https://img.shields.io/docker/pulls/franzsee/ccxt-rest.svgt)
[![Docker Stars](https://img.shields.io/docker/stars/franzsee/ccxt-rest.svg)](https://img.shields.io/docker/stars/franzsee/ccxt-rest.svgt)
[![Supported Exchanges](https://img.shields.io/badge/exchanges-117-blue.svg)](https://github.com/ccxt/ccxt/wiki/Exchange-Markets)

[![Hire Us](https://img.shields.io/badge/Need%20a%20Feature%3F-Hire%20Us-green.svg)](mailto:hello@adroit.ph?subject=CCXT-REST%20Development)

**Open Source Unified REST API of 100+ Crypto Exchange Sites !**

## Table of Contents

- [CCXT REST](#ccxt-rest)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Getting Started](#getting-started)
    - [Installation](#installation)
      - [NPM Package](#npm-package)
      - [Docker](#docker)
  - [TLDR](#tldr)
  - [Exchange Instance Management Commands](#exchange-instance-management-commands)
    - [Listing all available exchange sites](#listing-all-available-exchange-sites)
    - [Creating an instance of an exchange site](#creating-an-instance-of-an-exchange-site)
    - [Listing the ids of all created instances of an exchange site](#listing-the-ids-of-all-created-instances-of-an-exchange-site)
    - [Retreiving the details of an exchange instance](#retreiving-the-details-of-an-exchange-instance)
    - [Deleting an exchange instance](#deleting-an-exchange-instance)
  - [Common APIs](#common-apis)
    - [Fecthing the markets](#fecthing-the-markets)
    - [Fetching ticker](#fetching-ticker)
    - [Creating an order](#creating-an-order)
    - [Fetch open orders](#fetch-open-orders)
    - [Cancelling an order](#cancelling-an-order)
  - [API](#api)
  - [Feature / Support Request](#feature--support-request)

## Introduction

[CCXT](https://github.com/ccxt/ccxt/) is a popular open source library to connect to over 100 cryptocurrency exchange sites via a unified API. And the APIs are available by importing a nodejs, python or a PHP library. So if you're using any of those 3 programming languages, you'd be able to import and use ccxt. 

However, if you are not using those 3 programming languages, you can use ccxt-rest in order to connect to a ccxt's unified API via REST.

For example, if you want to get the list of support exchanges of ccxt, in nodejs, you would do the following

```javascript
var ccxt = require ('ccxt')

console.log (ccxt.exchanges) // print all available exchanges
```

..and you will get..

```javascript
[ '_1broker',
  '_1btcxe',
  'acx',
  'allcoin',
  ...
]
```

In ccxt-rest, you can do the following:

```bash
$ curl http://localhost:3000/exchanges
```

..and you will get..

```json
[
  "_1broker",
  "_1btcxe",
  "acx",
  ...
]
```

Furthermore, ccxt-rest allows you complete access to the ccxt APIs by exposing all of a ccxt exchange object's method as REST API. 

## Getting Started

### Installation

You can install this as a global node package, or run the server via docker

#### NPM Package

```bash
$ npm install -g ccxt-rest
$ ccxt-rest
```

#### Docker

```bash
$ docker run -p 3000:3000 franzsee/ccxt-rest
```

## TLDR

- List supported exchanges (_all possible values for `{{exchangeName}}`_)
    ```bash
   $ curl http://localhost:3000/exchanges
    ```

- List all exchange instance ids (_all possible values for `{{exchangeId}}`_)
    ```bash
    $ curl http://localhost:3000/exchanges/{{exchangeName}}
    ```

- Create an exchange instance (_creating an `{{exchangeId}}`_)
    ```bash
    $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}} -d '{"id":"myExchangeId","appKey":"myAppKey","secret":"myAppSecret"}'
    ```

- Deleting an exchange instance
    ```bash
    $ curl -X DELETE http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}
    ```

- Calling an exchange instance method (_the REST API format for most of the interesting stuff like retreival of trades, order book, your wallet/balances, creating an order, canceling an order, etc_)
    ```bash
    $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/{{methodName}} -d '["1stParameter", {"2ndParameter":"value"}, "etc"]'
    ```

_Note:_
- [CCXT REST](#ccxt-rest)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Getting Started](#getting-started)
    - [Installation](#installation)
      - [NPM Package](#npm-package)
      - [Docker](#docker)
  - [TLDR](#tldr)
  - [Exchange Instance Management Commands](#exchange-instance-management-commands)
    - [Listing all available exchange sites](#listing-all-available-exchange-sites)
    - [Creating an instance of an exchange site](#creating-an-instance-of-an-exchange-site)
    - [Listing the ids of all created instances of an exchange site](#listing-the-ids-of-all-created-instances-of-an-exchange-site)
    - [Retreiving the details of an exchange instance](#retreiving-the-details-of-an-exchange-instance)
    - [Deleting an exchange instance](#deleting-an-exchange-instance)
  - [Common APIs](#common-apis)
    - [Fecthing the markets](#fecthing-the-markets)
    - [Fetching ticker](#fetching-ticker)
    - [Creating an order](#creating-an-order)
    - [Fetch open orders](#fetch-open-orders)
    - [Cancelling an order](#cancelling-an-order)
  - [API](#api)
  - [Feature / Support Request](#feature--support-request)

## Exchange Instance Management Commands

Once ccxt-rest is running, but before we can integrate with any exchange site, we first need to create an exchange instance. An exchange instance is what is needed to define the connection with a particular exchange, and it is through the integration would be made.

### Listing all available exchange sites

Before we create an exchange instance, we can first list all avaiable exchange sites we can create an instance from


```bash
$ curl http://localhost:3000/exchanges
```

```json
[
  "_1broker",
  "_1btcxe",
  "acx",
  "allcoin",
  "anxpro",
  "bibox",
  "binance",
  "bit2c",
  "bitbank",
  "bitbay",
  "bitfinex",
  "bitfinex2",
  "bitflyer",
  "bithumb",
  "bitkk",
  "bitlish",
  "bitmarket",
  "bitmex",
  "bitso",
  "bitstamp",
  "bitstamp1",
  "bittrex",
  "bitz",
  "bl3p",
  "bleutrade",
  "braziliex",
  "btcbox",
  "btcchina",
  "btcexchange",
  "btcmarkets",
  "btctradeim",
  "btctradeua",
  "btcturk",
  "btcx",
  "bxinth",
  "ccex",
  "cex",
  "chbtc",
  "chilebit",
  "cobinhood",
  "coincheck",
  "coinegg",
  "coinex",
  "coinexchange",
  "coinfloor",
  "coingi",
  "coinmarketcap",
  "coinmate",
  "coinnest",
  "coinone",
  "coinsecure",
  "coinspot",
  "cointiger",
  "coolcoin",
  "cryptopia",
  "dsx",
  "ethfinex",
  "exmo",
  "exx",
  "flowbtc",
  "foxbit",
  "fybse",
  "fybsg",
  "gatecoin",
  "gateio",
  "gdax",
  "gemini",
  "getbtc",
  "hadax",
  "hitbtc",
  "hitbtc2",
  "huobi",
  "huobicny",
  "huobipro",
  "ice3x",
  "independentreserve",
  "indodax",
  "itbit",
  "jubi",
  "kraken",
  "kucoin",
  "kuna",
  "lakebtc",
  "lbank",
  "liqui",
  "livecoin",
  "luno",
  "lykke",
  "mercado",
  "mixcoins",
  "negociecoins",
  "nova",
  "okcoincny",
  "okcoinusd",
  "okex",
  "paymium",
  "poloniex",
  "qryptos",
  "quadrigacx",
  "quoinex",
  "southxchange",
  "surbitcoin",
  "therock",
  "tidebit",
  "tidex",
  "urdubit",
  "vaultoro",
  "vbtc",
  "virwox",
  "wex",
  "xbtce",
  "yobit",
  "yunbi",
  "zaif",
  "zb"
]
```

### Creating an instance of an exchange site

Once you have picked which exchange site you would like to create an instance of, you then need to take note of that as the exchangeName. Also, once you have created the exchange instance, you need to take note of the id of that exchange instance because that would be the exchangeId you will need for the other REST API calls.

From the list of available exchange sites, you pick one and used that in the following REST API

```bash
$ curl -X POST http://localhost:3000/exchanges/{{exchangeName}} -d '{"parameters":"here"}'
```

For example, if you choose `bitso`, you would do 

```bash
$ curl -X POST http://localhost:3000/exchanges/bitso -d '{"id":"myBitso","apikey":"mYapIKEy","secret":"6d792061706920736563726574"}'
```

Which would then respond with the JSON representation of the Exchange instance - something like this

```json
{
  ...
  "id": "myBitso",
  "name": "Bitso",
  "countries": "MX",
  "enableRateLimit": false,
  "rateLimit": 2000,
  ...
  "apikey": "mYapIKEy",
  "secret": "6d792061706920736563726574",
  "hasCORS": true,
  "hasPublicAPI": true,
  "hasPrivateAPI": true,
  "hasCancelOrder": true,
  "hasCancelOrders": false,
  "hasCreateDepositAddress": false,
  "hasCreateOrder": true,
  "hasCreateMarketOrder": true,
  "hasCreateLimitOrder": true,
  "hasDeposit": false,
  "hasEditOrder": true,
  "hasFetchBalance": true,
  "hasFetchBidsAsks": false,
  "hasFetchClosedOrders": false,
  "hasFetchCurrencies": false,
  "hasFetchDepositAddress": false,
  "hasFetchFundingFees": false,
  "hasFetchL2OrderBook": true,
  "hasFetchMarkets": true,
  "hasFetchMyTrades": true,
  "hasFetchOHLCV": true,
  "hasFetchOpenOrders": true,
  "hasFetchOrder": false,
  "hasFetchOrderBook": true,
  "hasFetchOrderBooks": false,
  "hasFetchOrders": false,
  "hasFetchTicker": true,
  "hasFetchTickers": false,
  "hasFetchTrades": true,
  "hasFetchTradingFees": false,
  "hasWithdraw": false,
  "tokenBucket": {
    "refillRate": 0.0005,
    "delay": 1,
    "capacity": 1,
    "defaultCost": 1,
    "maxCapacity": 1000
  }
}
```

_Note: The exchangeId here is `myBitso`. This and the exchangeName `bitso` would both be used most of the other REST API calls so those two need to be noted._

### Listing the ids of all created instances of an exchange site

To see the ids of all instances of a paritcular exchange site, we run the following command:

```bash
$ curl http://localhost:3000/exchanges/{{exchangeName}}
```

Again, if we use `bitso`, the REST API call would look like this

```bash
$ curl http://localhost:3000/exchanges/bitso
```

Which would return an array of instance ids. Something like this

```json
[
    "myBisto"
]
```

And with this, you can now use the id that you supplied in order to control this exchange instance. 

### Retreiving the details of an exchange instance

If we want to retrieve the details of an exhange, we just need to supply both exchange name and exchange id in a GET REST API call. The format is 

```bash
$ curl http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}
```

For example. Given an exchangeName of `bitso` and exchangeId of `myBitso`, we can do the following REST API call

```bash
$ curl http://localhost:3000/exchanges/bitso/myBitso
```

### Deleting an exchange instance

If we want to delete an exchange instance, we do the following REST API call.

```bash
$ curl -X DELETE http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}
```

For example. Given an exchangeName of `bitso` and exchangeId of `myBitso`, we can do the following REST API call

```bash
$ curl -X DELETE http://localhost:3000/exchanges/bitso/myBitso
```

## Common APIs

Once you have an exchange instance, you can then start calling methods of that exchange instance by supplying the following:

- [CCXT REST](#ccxt-rest)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Getting Started](#getting-started)
    - [Installation](#installation)
      - [NPM Package](#npm-package)
      - [Docker](#docker)
  - [TLDR](#tldr)
  - [Exchange Instance Management Commands](#exchange-instance-management-commands)
    - [Listing all available exchange sites](#listing-all-available-exchange-sites)
    - [Creating an instance of an exchange site](#creating-an-instance-of-an-exchange-site)
    - [Listing the ids of all created instances of an exchange site](#listing-the-ids-of-all-created-instances-of-an-exchange-site)
    - [Retreiving the details of an exchange instance](#retreiving-the-details-of-an-exchange-instance)
    - [Deleting an exchange instance](#deleting-an-exchange-instance)
  - [Common APIs](#common-apis)
    - [Fecthing the markets](#fecthing-the-markets)
    - [Fetching ticker](#fetching-ticker)
    - [Creating an order](#creating-an-order)
    - [Fetch open orders](#fetch-open-orders)
    - [Cancelling an order](#cancelling-an-order)
  - [API](#api)
  - [Feature / Support Request](#feature--support-request)

The format to call any exchange instance method is the following:

```bash
$ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/{{method}} -d '["1stParameter", {"2ndParameter":"value"}, "etc"]'
```

_Note: The HTTP Method for calling exchange instance method is always **POST**. Also the POST body is always of JSON format. Particularly, it's always an array wherein each entry represents the sequential parameter list of the method you are invoking._

### Fecthing the markets

```bash
$ curl -X POST http://localhost:3000/exchanges/bitso/myBitso/fetchMarkets
```

### Fetching ticker

```bash
$ curl -X POST http://localhost:3000/exchanges/bitso/myBitso/fetchTicker -d '["BTC/MXN"]'
```

### Creating an order

```bash
$ curl -X POST http://localhost:3000/exchanges/bitso/myBitso/createOrder -d '["BTC/MXN", "limit", "buy", 1, 500]'
```

### Fetch open orders

```bash
$ curl -X POST http://localhost:3000/exchanges/bitso/myBitso/fetchOpenOrders
```

### Cancelling an order

```bash
$ curl -X POST http://localhost:3000/exchanges/bitso/myBitso/fetchOpenOrders -d '["myOpenOrderId"]'
```

## API

The list of APIs as of this writing are the following

```
                                 User
    +-------------------------------------------------------------+
    |                            CCXT                             |
    +------------------------------+------------------------------+
    |            Public            |           Private            |
    +=============================================================+
    │                              .                              |
    │                    The Unified CCXT API                     |
    │                              .                              |
    |       loadMarkets            .           fetchBalance       |
    |       fetchMarkets           .            createOrder       |
    |       fetchCurrencies        .            cancelOrder       |
    |       fetchTicker            .             fetchOrder       |
    |       fetchTickers           .            fetchOrders       |
    |       fetchOrderBook         .        fetchOpenOrders       |
    |       fetchOHLCV             .      fetchClosedOrders       |
    |       fetchTrades            .          fetchMyTrades       |
    |                              .                deposit       |
    |                              .               withdraw       |
    │                              .                              |
    +=============================================================+
    │                              .                              |
    |                     Custom Exchange API                     |
    |                      (Derived Classes)                      |
    │                              .                              |
    |       publicGet...           .          privateGet...       |
    |       publicPost...          .         privatePost...       |
    |                              .          privatePut...       |
    |                              .       privateDelete...       |
    |                              .                   sign       |
    │                              .                              |
    +=============================================================+
    │                              .                              |
    |                      Base Exchange Class                    |
    │                              .                              |
    +=============================================================+
```

Again, the format to call a ccxt exchange method is the following

```bash
$ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/{{method}} -d '["1stParameter", {"2ndParameter":"value"}, "etc"]'
```

- [CCXT REST](#ccxt-rest)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Getting Started](#getting-started)
    - [Installation](#installation)
      - [NPM Package](#npm-package)
      - [Docker](#docker)
  - [TLDR](#tldr)
  - [Exchange Instance Management Commands](#exchange-instance-management-commands)
    - [Listing all available exchange sites](#listing-all-available-exchange-sites)
    - [Creating an instance of an exchange site](#creating-an-instance-of-an-exchange-site)
    - [Listing the ids of all created instances of an exchange site](#listing-the-ids-of-all-created-instances-of-an-exchange-site)
    - [Retreiving the details of an exchange instance](#retreiving-the-details-of-an-exchange-instance)
    - [Deleting an exchange instance](#deleting-an-exchange-instance)
  - [Common APIs](#common-apis)
    - [Fecthing the markets](#fecthing-the-markets)
    - [Fetching ticker](#fetching-ticker)
    - [Creating an order](#creating-an-order)
    - [Fetch open orders](#fetch-open-orders)
    - [Cancelling an order](#cancelling-an-order)
  - [API](#api)
  - [Feature / Support Request](#feature--support-request)

As of this writing, these are the documented methods in CCXT.

- `fetchMarkets ()`: Fetches a list of all available markets from an exchange and returns an array of markets (objects with properties such as `symbol`, `base`, `quote` etc.). Some exchanges do not have means for obtaining a list of markets via their online API. For those, the list of markets is hardcoded. 
   ```bash
   $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/fetchMarkets
   ```
- `loadMarkets ([reload])`: Returns the list of markets as an object indexed by symbol and caches it with the exchange instance. Returns cached markets if loaded already, unless the `reload = true` flag is forced.
   ```bash
   $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/loadMarkets -d '[reload]'
   ```
- `fetchOrderBook (symbol[, limit = undefined[, params = {}]])`: Fetch L2/L3 order book for a particular market trading symbol.
   ```bash
   $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/fetchOrderBook -d '[symbol[, limit = undefined[, params = {}]]]'
   ```
- `fetchL2OrderBook (symbol[, limit = undefined[, params]])`: Level 2 (price-aggregated) order book for a particular symbol.
   ```bash
   $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/fetchL2OrderBook -d '[symbol[, limit = undefined[, params]]]'
   ```
- `fetchTrades (symbol[, since[, [limit, [params]]]])`: Fetch recent trades for a particular trading symbol.
   ```bash
   $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/fetchTrades -d '[symbol[, since[, [limit, [params]]]]]'
   ```
- `fetchTicker (symbol)`: Fetch latest ticker data by trading symbol.
   ```bash
   $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/fetchTicker -d '[symbol]'
   ```
- `fetchBalance ()`: Fetch Balance.
   ```bash
   $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/fetchBalance
   ```
- `createOrder (symbol, type, side, amount[, price[, params]])`
   ```bash
   $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/createOrder -d '[symbol, type, side, amount[, price[, params]]]'
   ```
- `createLimitBuyOrder (symbol, amount, price[, params])`
   ```bash
   $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/createLimitBuyOrder -d '[symbol, amount, price[, params]]'
   ```
- `createLimitSellOrder (symbol, amount, price[, params])`
   ```bash
   $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/createLimitSellOrder -d '[symbol, amount, price[, params]]'
   ```
- `createMarketBuyOrder (symbol, amount[, params])`
   ```bash
   $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/createMarketBuyOrder -d '[symbol, amount[, params]]'
   ```
- `createMarketSellOrder (symbol, amount[, params])`
   ```bash
   $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/createMarketSellOrder -d '[symbol, amount[, params]]'
   ```
- `cancelOrder (id[, symbol[, params]])`
   ```bash
   $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/cancelOrder -d '[id[, symbol[, params]]]'
   ```
- `fetchOrder (id[, symbol[, params]])`
   ```bash
   $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/fetchOrder -d '[id[, symbol[, params]]]'
   ```
- `fetchOrders ([symbol[, since[, limit[, params]]]])`
   ```bash
   $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/fetchOrders -d '[[symbol[, since[, limit[, params]]]]]'
   ```
- `fetchOpenOrders ([symbol[, since, limit, params]]]])`
   ```bash
   $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/fetchOpenOrders -d '[[symbol[, since, limit, params]]]]]'
   ```
- `fetchClosedOrders ([symbol[, since[, limit[, params]]]])`
   ```bash
   $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/fetchClosedOrders -d '[[symbol[, since[, limit[, params]]]]]'
   ```
- `fetchMyTrades ([symbol[, since[, limit[, params]]]])`
   ```bash
   $ curl -X POST http://localhost:3000/exchanges/{{exchangeName}}/{{exchangeId}}/fetchMyTrades -d '[[symbol[, since[, limit[, params]]]]]'
   ```

***************************************************************

**For more information, kindly see the [CCXT Manual](https://github.com/ccxt/ccxt/wiki/Manual)**

***************************************************************

## Feature / Support Request 

Need a feature or need support? Reach out and let us know what you need.

[![Hire Us](https://img.shields.io/badge/Need%20a%20Feature%3F-Hire%20Us-green.svg)](https://adroit.ph/ccxt-rest-contact-us/)
