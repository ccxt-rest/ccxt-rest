const parallelTest = require('../_common/parallel-test');
const ccxt = require('ccxt');
const fs = require('fs');
const path = require('path');
const util = require('util');

const EXCHANGES_ROOT_PATH = require('./common').EXCHANGES_ROOT_PATH

const MARKET_PER_EXCHANGE_FILENAME = 'scripts/exchange-summary-dashboard/market-per-exchange.json'
const marketPerExchange = JSON.parse(fs.readFileSync(MARKET_PER_EXCHANGE_FILENAME))

const PUBLIC_API_LABEL = '<img src="https://img.shields.io/badge/Public%20API-green.svg" alt="Public API" />'
const PRIVATE_API_LABEL = '<img src="https://img.shields.io/badge/Private%20API-blue.svg" alt="Private API" />'
const NOT_SUPPORTED_LABEL = '<img src="https://img.shields.io/badge/Not%20Supported-yellow.svg" alt="Not Supported" />'
const UNEXPECTED_ERROR_LABEL = '<img src="https://img.shields.io/badge/Error%3A%20Unexpected-red.svg" alt="Unexpected Error" />'
const BROKEN_INTEGRATION_ERROR_LABEL = '<img src="https://img.shields.io/badge/Error%3A%20Broken%20Integration-red.svg" alt="Broken Integration Error" />'
const NETWORK_ERROR_LABEL = '<img src="https://img.shields.io/badge/Error%3A%20Network-red.svg" alt="Network Error" />'
const REQUEST_TIMEOUT_ERROR_LABEL = '<img src="https://img.shields.io/badge/Error%3A%20Timeout-red.svg" alt="Request Timeout Error" />'

const beforeAll = function() {
    if (!fs.existsSync(EXCHANGES_ROOT_PATH)) {
        fs.mkdirSync(EXCHANGES_ROOT_PATH, {recursive:true});
    }
    fs.readdirSync(EXCHANGES_ROOT_PATH).forEach(fileName => {
        fs.unlinkSync(EXCHANGES_ROOT_PATH + fileName)
    })
}

const afterAll = function() {
    const table_delimiter = '</td><td>'
    const fileNames = fs.readdirSync(EXCHANGES_ROOT_PATH)
    let exchangeDetails = {}
    fileNames.forEach(fileName => {
        const exchangeName = fileName.split('.json')[0]
        exchangeDetails[exchangeName] = JSON.parse(fs.readFileSync(EXCHANGES_ROOT_PATH + fileName))
    })

    let exchangeNames = []
    exchangeNames = Object.keys(exchangeDetails).sort()

    const toRow = function(array) {
        return '<tr><td>' + array.join(table_delimiter) + '</td></tr>'
    }

    const currentDate = new Date().toUTCString()

    const HTML_TEMPLATE = `
    <html lang="en">
        <head><meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    
        <title>Exchange Summary</title>
    </head>
    <body>
    <div class="container-fluid" style="margin:2em">
        <div class="row" style="margin:2em 0 2em 0">    
            %s
        </div>
    
        <div class="row">    
            <table class="table">
                <thead>
                    %s
                </thead>
                <tbody>
                    %s
                </tbody>
            </table>
        </div>
    </div>
    </body>
    </html>
    `

    const lastExecutionDate = `<img src="https://img.shields.io/badge/Last%20Execution%20Date-${currentDate}-green.svg" alt="Last Execution Date: ${currentDate}" />`
    const headers = toRow(['Exchange', 'Connect', 'Market', 'Ticker', 'Tickers', 'Order Book', 'Trades'])

    function statusCodeToLabel(body) {
        const statusCode = body && body.statusCode
        if (statusCode == 200) {
            return PUBLIC_API_LABEL
        } else if (statusCode == 401) {
            return PRIVATE_API_LABEL
        } else if (statusCode == 408) {
            return REQUEST_TIMEOUT_ERROR_LABEL
        } else if (statusCode == 500) {
            return UNEXPECTED_ERROR_LABEL
        } else if (statusCode == 501) {
            return NOT_SUPPORTED_LABEL
        } else if (statusCode == 503) {
            return BROKEN_INTEGRATION_ERROR_LABEL
        } else if (statusCode == 504) {
            return NETWORK_ERROR_LABEL
        } else {
            return `<img src="https://img.shields.io/badge/${statusCode}-grey.svg" alt="${statusCode}" />`
        }
    }

    const rows = exchangeNames.map((exchangeName) => {
        return toRow([
            exchangeName, 
            statusCodeToLabel(exchangeDetails[exchangeName].connect), 
            statusCodeToLabel(exchangeDetails[exchangeName].markets),
            statusCodeToLabel(exchangeDetails[exchangeName].ticker),
            statusCodeToLabel(exchangeDetails[exchangeName].tickers),
            statusCodeToLabel(exchangeDetails[exchangeName].orderBook),
            statusCodeToLabel(exchangeDetails[exchangeName].trades)
        ])
    }).join('\n')

    const summary = util.format(HTML_TEMPLATE, lastExecutionDate, headers, rows)

    const exchangeSummaryReportPath = EXCHANGES_ROOT_PATH + 'index.html'
    fs.writeFileSync(exchangeSummaryReportPath, summary);

    const message = `* Exchange Summary Report generated in '${exchangeSummaryReportPath}' *`
    const border = message.split('').map(_ => '*').join('')
    console.info(border)
    console.info(message)
    console.info(border)

    if (!fs.existsSync(MARKET_PER_EXCHANGE_FILENAME)) {
        fs.writeFileSync(MARKET_PER_EXCHANGE_FILENAME, '{}')
    }
    const existingMarketPerExchange = JSON.parse(fs.readFileSync(MARKET_PER_EXCHANGE_FILENAME))
    const newMarketPerExchange = fs.readdirSync(EXCHANGES_ROOT_PATH)
        .filter(filename => filename.endsWith('.json'))
        .map(filename => path.join(EXCHANGES_ROOT_PATH, filename))
        .map(filename => { 
            const json = JSON.parse(fs.readFileSync(filename).toString()); 
            json.exchange = filename.split('/').reverse()[0].split('.json')[0]; 
            return json; 
        })
        .filter(json => json.markets && json.markets && json.markets.response && json.markets.response.length)
        .map(json => { return {exchange:json.exchange, market:json.markets.response[0].symbol}; })
        .reduce(
            (obj, data) => { 
                obj[data.exchange] = data.market; 
                return obj; 
            }, 
            {})
    const combinedMarketPerExchange = Object.assign(existingMarketPerExchange, newMarketPerExchange)
    fs.writeFileSync(MARKET_PER_EXCHANGE_FILENAME, JSON.stringify(combinedMarketPerExchange, null, 2))
}

parallelTest.runParallelTests(
    ccxt.exchanges, 
    `${__dirname}/generated`, 
    `${__dirname}/_template-test.js`, 
    (testContent, exchangeName) => {
        const market = marketPerExchange[exchangeName]
        return testContent
            .replace(new RegExp('%%market%%', 'g'), market);
    }, 
    (mocha, mochaParamObject) => {
        mocha.reporter('mochawesome', {
            reportDir : './out/exchange-summary-dashboard',
            reportTitle: 'CCXT-REST Exchange Summary Dashboard',
            reportPageTitle: 'CCXT-REST Exchange Summary Dashboard'
        })
        return mocha
    },
    beforeAll,
    afterAll
    )