const ccxt = require('ccxt');
const fs = require('fs');
const request = require('supertest');
const util = require('util')

const server = require('../app');
const db = require('../api/helpers/db');

var exchangeToMarket = {}

describe('> exploratory', function() {

    const EXCHANGES_ROOT_PATH = './out/exchanges/';

    const PUBLIC_API_LABEL = '<img src="https://img.shields.io/badge/Public%20API-green.svg" alt="Public API" />'
    const PRIVATE_API_LABEL = '<img src="https://img.shields.io/badge/Private%20API-blue.svg" alt="Private API" />'
    const UNEXPECTED_ERROR_LABEL = '<img src="https://img.shields.io/badge/Error%3A%20Unexpected-red.svg" alt="Unexpected Error" />'
    const BROKEN_INTEGRATION_ERROR_LABEL = '<img src="https://img.shields.io/badge/Error%3A%20Broken%20Integration-red.svg" alt="Broken Integration Error" />'
    const NOT_SUPPORTED_ERROR_LABEL = '<img src="https://img.shields.io/badge/Error%3A%20Not%20Supported-yellow.svg" alt="Not Supported Error" />'
    const NETWORK_ERROR_LABEL = '<img src="https://img.shields.io/badge/Error%3A%20Network-red.svg" alt="Network Error" />'

    before(function(resolve) {
        if (!fs.existsSync(EXCHANGES_ROOT_PATH)) {
            fs.mkdirSync(EXCHANGES_ROOT_PATH, {recursive:true});
        }
        fs.readdirSync(EXCHANGES_ROOT_PATH).forEach(fileName => {
            fs.unlinkSync(EXCHANGES_ROOT_PATH + fileName)
        })
        resolve()
    })

    after(function(resolve) {
        const table_delimiter = '</td><td>'
        const fileNames = fs.readdirSync(EXCHANGES_ROOT_PATH)
        let exchangeDetails = {}
        fileNames.forEach(fileName => {
            const exchangeName = fileName.split('.json')[0]
            exchangeDetails[exchangeName] = JSON.parse(fs.readFileSync(EXCHANGES_ROOT_PATH + fileName))
        })

        let exchangeNames = []
        exchangeNames = Object.keys(exchangeDetails).sort()

        let toRow = function(array) {
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

        
        fs.writeFileSync(EXCHANGES_ROOT_PATH + 'index.html', summary);
        
        resolve()
    })

    function logExchangeDetail(exchangeName, modifyExchangeDetailFunc) {
        const filePath = EXCHANGES_ROOT_PATH + exchangeName + '.json'
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '{}');
        }
        let exchangeDetail = JSON.parse(fs.readFileSync(filePath));
        modifyExchangeDetailFunc(exchangeDetail)
        fs.writeFileSync(filePath, JSON.stringify(exchangeDetail));
    }

    function statusCodeToLabel(statusCode) {
        if (statusCode == 200) {
            return PUBLIC_API_LABEL
        } else if (statusCode == 401) {
            return PRIVATE_API_LABEL
        } else if (statusCode == 500) {
            return UNEXPECTED_ERROR_LABEL
        } else if (statusCode == 501) {
            return NOT_SUPPORTED_ERROR_LABEL
        } else if (statusCode == 503) {
            return BROKEN_INTEGRATION_ERROR_LABEL
        } else if (statusCode == 504) {
            return NETWORK_ERROR_LABEL
        } else {
            return `<img src="https://img.shields.io/badge/${statusCode}-grey.svg" alt="${statusCode}" />`
        }
    }

    if (process.env.EXPLORE) {
        it('warm up server', function(done) {
            this.timeout(10000)
            request(server)
                .get('/exchanges/')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .end((err, res) => {
                    done();
                });
        });

        function generateTest(_ctx, property, config) {
            config = config || {}
            config.canExecute = config.canExecute || (_ctx => true)
            return it('> [' + _ctx.exchangeName + '] ' + property, function(done) {
                this.timeout(10000)
                if (_ctx.exchange && config.canExecute(_ctx)) {
                    const query = config.queryBuilder ? config.queryBuilder(_ctx) : undefined
                    request(server)
                        .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/' + property)
                        .query(query)
                        .retry(3)
                        .set('Accept', 'application/json')
                        .expect('Content-Type', /json/)
                        .end((err, res) => {
                            logExchangeDetail(_ctx.exchangeName, exchangeDetail => {
                                exchangeDetail[property] = res.status
                            })

                            if (config.successCallback) {
                                config.successCallback(_ctx, res)
                            }

                            done();
                        });
                } else {
                    logExchangeDetail(_ctx.exchangeName, exchangeDetail => {
                        exchangeDetail[property] = 'n/a'
                    })
                    done()
                }
            })
        }

        ccxt.exchanges.map(exchangeName => {
            return {
                'exchangeName': exchangeName,
                'exchangeId': exchangeName + '1'
            }}).forEach(_ctx => {
                describe('> ' + _ctx.exchangeName + ' without API keys', function() {
                    after(function() {
                        this.timeout(10000)
                        return new Promise((resolve) => {
                            request(server)
                                .delete('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId)
                                .set('Accept', 'application/json')
                                .expect('Content-Type', /json/)
                                .end((err, res) => {
                                    resolve();
                                });
                        });
                    });

                    it('> [' + _ctx.exchangeName + '] Instance creation', function(done) {
                        this.timeout(10000)
                        request(server)
                            .post('/exchange/' + _ctx.exchangeName)
                            .send({'id':_ctx.exchangeId})
                            .retry(3)
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .end((err, res) => {
                                logExchangeDetail(_ctx.exchangeName, exchangeDetail => {
                                    exchangeDetail.connect = res.status
                                })

                                if (res.status == 200) {
                                    _ctx.exchange = db.getExchange(_ctx.exchangeName, _ctx.exchangeId);
                                }
                
                                done();
                            });
                    })

                    generateTest(_ctx, 'markets', {
                        successCallback: function(_ctx, res) {
                            if (res && res.body && res.body.length > 0) {
                                exchangeToMarket[_ctx.exchangeName] = res.body[0].symbol
                            }
                        }
                    })

                    generateTest(_ctx, 'ticker', {
                        canExecute : function(_ctx) {
                            return exchangeToMarket[_ctx.exchangeName]
                        },
                        queryBuilder : function(_ctx) {
                            return {
                                symbol : exchangeToMarket[_ctx.exchangeName]
                            }
                        }
                    })

                    generateTest(_ctx, 'tickers')

                    generateTest(_ctx, 'orderBook', {
                        canExecute : function(_ctx) {
                            return exchangeToMarket[_ctx.exchangeName]
                        },
                        queryBuilder : function(_ctx) {
                            return {
                                symbol : exchangeToMarket[_ctx.exchangeName]
                            }
                        }
                    })

                    generateTest(_ctx, 'trades', {
                        canExecute : function(_ctx) {
                            return exchangeToMarket[_ctx.exchangeName]
                        },
                        queryBuilder : function(_ctx) {
                            return {
                                symbol : exchangeToMarket[_ctx.exchangeName]
                            }
                        }
                    })
                })
            })
    }

});
