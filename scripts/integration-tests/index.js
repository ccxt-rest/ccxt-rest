const parallelTest = require('../_common/parallel-test')
const ccxt = require('ccxt')
const path = require('path')

const ccxtRestTestExchangeDetails = process.env.CCXTREST_TEST_EXCHANGEDETAILS
const exchangeDetailsMap = JSON.parse(ccxtRestTestExchangeDetails)

const SKIPPED_EXCHANGES = JSON.parse(process.env.SKIPPED_EXCHANGES || '[]')

let testDirectories = []

parallelTest.runParallelProcessTests(
    ccxt.exchanges
        .filter(exchangeName => exchangeDetailsMap[exchangeName])
        .filter(exchangeName => !SKIPPED_EXCHANGES.includes(exchangeName)), 
    `${__dirname}/generated`, 
    `${__dirname}/_template-test.js`, 
    (testContent, exchangeName) => {
        var exchangeDetails = exchangeDetailsMap[exchangeName] || {};
        const exchangeId = exchangeDetails.creds ? exchangeDetails.creds.id : (exchangeName + new Date().getTime());

        const creds = JSON.stringify(exchangeDetails.creds)

        const knownCurrencyPairs = JSON.stringify(exchangeDetails.knownCurrencyPairs)

        const targetCurrencyPair = exchangeDetails.targetCurrencyPair

        const exchange = new ccxt[exchangeName]()

        const fetchClosedOrders = exchange.has.fetchClosedOrders ? 200 : 501;
        const fetchOrders = exchange.has.fetchOrders ? 200 : 501;
        const fetchMyTrades = exchange.has.fetchMyTrades ? 200 : 501;
        const fetchTicker = exchange.has.fetchTicker ? 200 : 501;
        const fetchTickers = exchange.has.fetchTickers ? 200 : 501;

        return testContent
            .replace(new RegExp('%%exchangeId%%', 'g'), exchangeId)
            .replace(new RegExp('%%creds%%', 'g'), creds)
            .replace(new RegExp('%%knownCurrencyPairs%%', 'g'), knownCurrencyPairs)
            .replace(new RegExp('%%targetCurrencyPair%%', 'g'), targetCurrencyPair)
            .replace(new RegExp("%%expectedStatusCodesFetchClosedOrders%%", 'g'), fetchClosedOrders)
            .replace(new RegExp("%%expectedStatusCodesFetchOrders%%", 'g'), fetchOrders)
            .replace(new RegExp("%%expectedStatusCodesFetchMyTrades%%", 'g'), fetchMyTrades)
            .replace(new RegExp("%%expectedStatusCodesFetchTicker%%", 'g'), fetchTicker)
            .replace(new RegExp("%%expectedStatusCodesFetchTickers%%", 'g'), fetchTickers)
            ;
    }, 
    (command) => {
        const exchangeName = command.filter(candidate => candidate.endsWith('.js'))[0].split('/').reverse()[0].split('.')[0]
        const title = `CCXT-REST ${exchangeName.toUpperCase()} Integration Tests Results`
        const testDirectory = `./out/integration-tests/${exchangeName}`
        testDirectories.push(path.resolve(testDirectory))
        command = [...command, '--reporter', 'mochawesome', '--reporter-options', `reportDir=${testDirectory},reportTitle='${title}',reportPageTitle='${title}'`]
        return command
    },
    () => {},
    () => {
        console.info(`Generated reports in:\n * ${testDirectories.join('\n * ')}\n`)
    }
    )