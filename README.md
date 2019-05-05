<p align="center">
<a href="https://ccxt-rest.io" alt="CCXT-REST"><img src="https://ccxt-rest.io/img/ccxt-rest-signature.png" width=700 alt="CCXT-REST"></a>
</p>

<div align="center" style="font-size:2em;font-style:bold;margin:-0.5em 0 -0.5em 0">
<a href="https://ccxt-rest.io" alt="CCXT-REST">ccxt-rest.io</a>
</div>

<p align="center" style="font-style:italic;padding-bottom:2em;">
Connect to 100+ <span style="font-style:bold;text-decoration:underline;font-size:1.5em">C</span>rypto <span style="font-style:bold;text-decoration:underline;font-size:1.5em">C</span>urrency e<span style="font-style:bold;text-decoration:underline;font-size:1.5em">X</span>change <span style="font-style:bold;text-decoration:underline;font-size:1.5em">T</span>rading platforms using the same <span style="font-style:bold;text-decoration:underline;font-size:1.5em">REST</span> API!
</p>

[![Build Status](https://travis-ci.org/franz-see/ccxt-rest.svg)](https://travis-ci.org/franz-see/ccxt-rest)
[![npm](https://img.shields.io/npm/v/ccxt-rest.svg)](https://npmjs.com/package/ccxt-rest)
[![NPM Downloads](https://img.shields.io/npm/dm/ccxt-rest.svg)](https://www.npmjs.com/package/ccxt-rest)
[![Docker Pulls](https://img.shields.io/docker/pulls/franzsee/ccxt-rest.svg)](https://img.shields.io/docker/pulls/franzsee/ccxt-rest.svgt)
[![Supported Exchanges](https://img.shields.io/badge/exchanges-135-blue.svg)](https://github.com/ccxt/ccxt/wiki/Exchange-Markets)

[![Gitter](https://img.shields.io/gitter/room/ccxt-rest/community.svg)](https://gitter.im/ccxt-rest/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

[![Hire Us](https://img.shields.io/badge/Need%20a%20Feature%3F-Hire%20Us-green.svg)](https://adroit.ph/ccxt-rest-contact-us/)

# Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [Installation](#installation)
  - [Docker](#docker)
  - [NPM Package](#npm-package)
- [Getting Started](#getting-started)
  - [Providing API Keys and Secret](#providing-api-keys-and-secret)
  - [List All Supported Currency Pairs](#list-all-supported-currency-pairs)
  - [Get Ticker for a Currency Pair](#get-ticker-for-a-currency-pair)
  - [Get Order Book for a Currency Pair](#get-order-book-for-a-currency-pair)
  - [Placing an Order](#placing-an-order)
  - [Cancelling an Order](#cancelling-an-order)
- [API](#api)
- [Exchange Summary](#exchange-summary)
- [Feature / Support Request](#feature--support-request)

# Introduction

CCXT-REST provides a Unified REST APIs to allow clients access to retrieve data (ticker, order book, trades, your order, your trades, balances, etc) and to create and cancel orders from over 100 cryptocurrency exhange sites. And it is built on top of the popular open source project [CCXT](https://github.com/ccxt/ccxt/)

# Installation

You can install either through docker or as a global node package

## Docker

```bash
$ docker run -p 3000:3000 franzsee/ccxt-rest
```

## NPM Package

```bash
$ npm install -g ccxt-rest
$ ccxt-rest
```

# Getting Started

CCXT-REST supports over 100 crytpocurrency exchange sites. If you want to access public data, for most exchanges, you can access them directly without any API Keys or Secret.

 * `GET:/exchanges/{exchangeName}/markets`
 * `GET:/exchanges/{exchangeName}/ticker`
 * `GET:/exchanges/{exchangeName}/tickers`
 * `GET:/exchanges/{exchangeName}/orderBook`
 * `GET:/exchanges/{exchangeName}/trades`

In binance, it would look something like this

 * `GET:/exchanges/binance/markets`
 * `GET:/exchanges/binance/ticker?symbol=BTC/USDT`
 * `GET:/exchanges/binance/tickers`
 * `GET:/exchanges/binance/orderBook?symbol=BTC/USDT`
 * `GET:/exchanges/binance/trades?symbol=BTC/USDT`

However, some exchanges though require you to have an API Key and Secret even when accessing public data. For example, for cointiger, you would need to get an API Key and Secret first from cointiger [see cointiger's official documentation for more info](https://github.com/cointiger/api-docs-en/wiki#create-api-key), and then you would need to provide those to `ccxt-rest`

  * `POST:/exchanges/cointiger -d {"id":"myCoinTiger","apiKey":"myApiKey","secret":"$hcreT"}`
  * `GET:/exchanges/cointiger/markets -H 'Authorization: Bearer xxx.yyy.zzz'`(_where `xxx.yyy.zzz` was part of the response of `POST:/exchanges/cointiger`_)
  * `GET:/exchanges/cointiger/ticker?symbol=BTC/LTC -H 'Authorization: Bearer xxx.yyy.zzz'`
  * `GET:/exchanges/cointiger/tickers -H 'Authorization: Bearer xxx.yyy.zzz'`
  * `GET:/exchanges/cointiger/orderBook?symbol=BTC/LTC -H 'Authorization: Bearer xxx.yyy.zzz'`
  * `GET:/exchanges/cointiger/trades?symbol=BTC/LTC -H 'Authorization: Bearer xxx.yyy.zzz'`

Lastly, for private data like your user orders, trades, balances and for actions like placing and cancelling orders, you would definitely need to provide the API Key and Secret for your exchange to `ccxt-rest`.

![CCXT-REST Overview](https://ccxt-rest.io/images/ccxt-rest-overview.png)

*****
_**Note: The API listing below is now comprehensive. For a full list of APIs supported, see https://ccxt-rest.io**_
*****

## Providing API Keys and Secret
```bash
$ curl -X POST http://localhost:3000/exchange/binance \
  -H 'Accept: application/json'
  -d {
    "id" : "myBinance",
    "apiKey" : "myApiKey",
    "secret" : "s3cr3t"
  }
```

This would then return something like this

```
{
  "token":"xxx.yyy.zzz"
}
```


## List All Supported Currency Pairs
```bash
$ curl -X GET http://localhost:3000/exchange/binance/markets \
  -H 'Accept: application/json'
```

## Get Ticker for a Currency Pair
```bash
$ curl -X GET http://localhost:3000/exchange/binance/ticker?symbol=BTC/USDT \
  -H 'Accept: application/json'
```

## Get Order Book for a Currency Pair
```bash
$ curl -X GET http://localhost:3000/exchange/binance/orderBook?symbol=BTC/USDT \
  -H 'Accept: application/json'
```

## Placing an Order
```bash
$ curl -X POST http://localhost:3000/exchange/binance/order \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -H 'Authorization: Bearer xxx.yyy.zzz'
  -d {
  "symbol": "string",
  "type": "market",
  "side": "buy",
  "amount": 0,
  "price": 0
}
```

## Cancelling an Order
_Note: `12345` is the id of the order you want to cancel_

```bash
$ curl -X DELETE http://localhost:3000/exchange/binance/order/12345 \
  -H 'Accept: application/json'
  -H 'Authorization: Bearer xxx.yyy.zzz'
```

# API

For a complete list of API, see https://ccxt-rest.io

![CCXT-REST API Documentation](https://ccxt-rest.io/images/ccxt-rest-docs.png)

# Exchange Summary 

For a full list of supported exchanges and as to which of their APIs are public, private or even broken, checkout https://ccxt-rest.io/#exchange-api-statuses. The format there looks something like this

_**Note: The table below is just an example. This does NOT represent the current state of these API statuses**_

| Exchange | Connect | Market | Ticker | Tickers | Order Book | Trades |
| -------- | ------- | ------ | ------ | ------- | ---------- | ------ |
| ...      | ...     | ...    | ...    | ...     | ...        | ...    | 
| _(sample only)_ | _(sample only)_ | _(sample only)_ | _(sample only)_ | _(sample only)_ | _(sample only)_ | _(sample only)_ |
| binance  | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Public API](https://img.shields.io/badge/Public%20API-green.svg)| ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) |
| coinspot  | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Private API](https://img.shields.io/badge/Private%20API-blue.svg) | ![Not Supported](https://img.shields.io/badge/Not%20Supported-yellow.svg)| ![Private API](https://img.shields.io/badge/Private%20API-blue.svg) | ![Private API](https://img.shields.io/badge/Private%20API-blue.svg) |
| gemini  | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Not Supported](https://img.shields.io/badge/Not%20Supported-yellow.svg)| ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) |
| kraken  | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Public API](https://img.shields.io/badge/Public%20API-green.svg)| ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) |
| poloniex | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Public API](https://img.shields.io/badge/Public%20API-green.svg)| ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) |
| quadrigacx | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Public API](https://img.shields.io/badge/Public%20API-green.svg) | ![Error: Unexpected](https://img.shields.io/badge/Error%3A%20Unexpected-red.svg) | ![Error: Unexpected](https://img.shields.io/badge/Error%3A%20Unexpected-red.svg) | ![Error: Unexpected](https://img.shields.io/badge/Error%3A%20Unexpected-red.svg) | ![Error: Unexpected](https://img.shields.io/badge/Error%3A%20Unexpected-red.svg) |
| _(sample only)_ | _(sample only)_ | _(sample only)_ | _(sample only)_ | _(sample only)_ | _(sample only)_ | _(sample only)_ |
| ...      | ...     | ...    | ...    | ...     | ...        | ...    | 

_**Note: The table above is just an example. This does NOT represent the current state of these API statuses**_

For full list of the current statuses, see https://ccxt-rest.io/#exchange-api-statuses

# Feature / Support Request 

Need a feature or need support? Reach out and let us know what you need.

[![Hire Us](https://img.shields.io/badge/Need%20a%20Feature%3F-Hire%20Us-green.svg)](https://adroit.ph/ccxt-rest-contact-us/)
