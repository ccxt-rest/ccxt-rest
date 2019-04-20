const ccxt = require('ccxt');
const expect = require('chai').expect;
const fs = require('fs');
const should = require('should');
const request = require('supertest');

const server = require('../app');
const db = require('../api/helpers/db');

describe('> exploratory', function() {

    const EXCHANGES_ROOT_PATH = './out/exchanges/';

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
        const table_delimiter = ' | '
        const fileNames = fs.readdirSync(EXCHANGES_ROOT_PATH)
        let exchangeDetails = {}
        fileNames.forEach(fileName => {
            const exchangeName = fileName.split('.json')[0]
            exchangeDetails[exchangeName] = JSON.parse(fs.readFileSync(EXCHANGES_ROOT_PATH + fileName))
        })

        let exchangeNames = []
        exchangeNames = Object.keys(exchangeDetails).sort()

        let summary = []
        
        // header
        summary.push(table_delimiter + exchangeNames.join(table_delimiter) + table_delimiter)

        // header splitter
        summary.push(table_delimiter + exchangeNames.map(() => {
            return '---'
        }).join(table_delimiter) + table_delimiter)

        const buildPropertyRow = function(propertyName) {
            return table_delimiter + exchangeNames.map(exchangeName => {
                return exchangeDetails[exchangeName][propertyName]
            }).join(table_delimiter) + table_delimiter
        }

        // connect property
        summary.push(buildPropertyRow('connect'))

        // market property
        summary.push(buildPropertyRow('market'))
        summary.push('\n')

        fs.writeFileSync(EXCHANGES_ROOT_PATH + '__summary.md', summary.join('\n'));
        
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
            return 'public'
        } else if (statusCode == 401) {
            return 'private'
        } else {
            return statusCode
        }
    }

    if (process.env.EXPLORE) {
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
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .end((err, res) => {
                                logExchangeDetail(_ctx.exchangeName, exchangeDetail => {
                                    exchangeDetail.connect = statusCodeToLabel(res.status)
                                })

                                if (res.status == 200) {
                                    _ctx.exchange = db.getExchange(_ctx.exchangeName, _ctx.exchangeId);
                                }
                
                                done();
                            });
                    })

                    it('> [' + _ctx.exchangeName + '] Markets', function(done) {
                        this.timeout(10000)
                        if (_ctx.exchange) {
                            request(server)
                            .get('/exchange/' + _ctx.exchangeName + '/' + _ctx.exchangeId + '/markets')
                            .set('Accept', 'application/json')
                            .expect('Content-Type', /json/)
                            .end((err, res) => {
                                logExchangeDetail(_ctx.exchangeName, exchangeDetail => {
                                    exchangeDetail.market = statusCodeToLabel(res.status)
                                })

                                //done(err);
                                done();
                            });
                        } else {
                            logExchangeDetail(_ctx.exchangeName, exchangeDetail => {
                                exchangeDetail.market = 'n/a'
                            })
                            done()
                        }
                    })
                })
            })
    }

});
