<p align="center">
<a href="https://ccxt-rest.io" alt="CCXT-REST"><img src="https://ccxt-rest.io/images/logo.png" width=700 alt="CCXT-REST"></a>
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
[![Supported Exchanges](https://img.shields.io/badge/exchanges-134-blue.svg)](https://github.com/ccxt/ccxt/wiki/Exchange-Markets)

[![Gitter](https://img.shields.io/gitter/room/ccxt-rest/community.svg)](https://gitter.im/ccxt-rest/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

[![Hire Us](https://img.shields.io/badge/Need%20a%20Feature%3F-Hire%20Us-green.svg)](https://adroit.ph/ccxt-rest-contact-us/)

# Table of Contents

- [Table of Contents](#table-of-contents)
- [Introduction](#introduction)
- [Installation](#installation)
  - [Docker](#docker)
  - [NPM Package](#npm-package)
- [Getting Started](#getting-started)
  - [List All Supported Currency Pairs](#list-all-supported-currency-pairs)
  - [Get Ticker for a Currency Pair](#get-ticker-for-a-currency-pair)
  - [Get Order Book for a Currency Pair](#get-order-book-for-a-currency-pair)
  - [Placing an Order](#placing-an-order)
  - [Cancelling an Order](#cancelling-an-order)
- [API](#api)
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

CCXT-REST supports over 100 crytpocurrency exchange sites. However, in order to start invoking API calls on most of them, you would first need to get an API Key and Secret from them. 

So if you want to interact with Binance (for example), you would have to generate an API Key and Secret for binance first ([see binance's official documentation for more info](https://support.binance.com/hc/en-us/articles/360002502072-How-to-create-API)).

Once you have an API Key and Secret, you will then create an 'instance' from CCXT-REST by providing CCXT-REST a reference id to this instance, your API Key and Secret for binance

```bash
$ curl -X POST http://localhost:10010/exchange/{exchangeName} \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d {
    "id": "myBinance",
    "apiKey": "myApiKey",
    "secret": "s3cret",
    "enableRateLimit": true
  }
```

Once you have created an exchange instance, you can then start invoking calls against that exchange instance

![CCXT-REST Overview](https://ccxt-rest.io/images/ccxt-rest-overview.png)

*****
_**Note: The API listing below is now comprehensive. For a full list of APIs supported, see https://ccxt-rest.io**_
*****

## List All Supported Currency Pairs
```bash
$ curl -X GET http://localhost:3000/exchange/binance/myBinance/markets \
  -H 'Accept: application/json'
```

## Get Ticker for a Currency Pair
```bash
$ curl -X GET http://localhost:3000/exchange/binance/myBinance/ticker?symbol=BTC/USDT \
  -H 'Accept: application/json'
```

## Get Order Book for a Currency Pair
```bash
$ curl -X GET http://localhost:3000/exchange/binance/myBinance/orderBook?symbol=BTC/USDT \
  -H 'Accept: application/json'
```

## Placing an Order
```bash
$ curl -X POST http://localhost:3000/exchange/binance/myBinance/order \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
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
$ curl -X DELETE http://localhost:3000/exchange/binance/myBinance/order/12345 \
  -H 'Accept: application/json'
```

# API

For a complete list of API, see https://ccxt-rest.io

![CCXT-REST API Documentation](https://ccxt-rest.io/images/ccxt-rest-docs.png)

# Feature / Support Request 

Need a feature or need support? Reach out and let us know what you need.

[![Hire Us](https://img.shields.io/badge/Need%20a%20Feature%3F-Hire%20Us-green.svg)](https://adroit.ph/ccxt-rest-contact-us/)
