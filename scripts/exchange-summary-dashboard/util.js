'use strict'

const expect = require('chai').expect;
const fs = require('fs');
const superagent = require('superagent');

const EXCHANGES_ROOT_PATH = require('./common').EXCHANGES_ROOT_PATH

const REPORT_ONLY = process.env.REPORT_ONLY

const TIMEOUT_MS = process.env.TIMEOUT_MS || 10000

function logExchangeDetail(exchangeName, modifyExchangeDetailFunc) {
    const filePath = EXCHANGES_ROOT_PATH + exchangeName + '.json'
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '{}');
    }
    let exchangeDetail = JSON.parse(fs.readFileSync(filePath));
    modifyExchangeDetailFunc(exchangeDetail)
    fs.writeFileSync(filePath, JSON.stringify(exchangeDetail));
}

function assertResponse(res) {
    if (!REPORT_ONLY) {
        expect(res.type).to.be.eql('application/json');
        expect(res.status).to.satisfy(statusCode => {
            return (200 <= statusCode && statusCode < 300) || statusCode == 501
        }, 'Should have been a success (status code between 200 and 299), or "Not Supported" (status code 501)')
    }
}

function generateTest(_ctx, property, config) {
    config = config || {}
    config.canExecute = config.canExecute || (_ctx => true)
    let subPath
    if (typeof(config.subPath) === 'string') {
        subPath = config.subPath
    } else {
        subPath = property
    }
    return it(`> [${_ctx.exchangeName}] ${property}`, function(done) {
        if (config.canExecute(_ctx)) {
            this.timeout(0)
            const query = config.queryBuilder ? config.queryBuilder(_ctx) : undefined
            const url = `${_ctx.baseUrl}/exchange/${_ctx.exchangeName}/${subPath}`
            superagent
                .get(url)
                .query(query)
                .retry(3)
                .timeout(TIMEOUT_MS)
                .end((err, res) => {
                    logExchangeDetail(_ctx.exchangeName, exchangeDetail => {
                        exchangeDetail[property] = exchangeDetail[property] || {}
                        exchangeDetail[property].statusCode = (res && res.status) || 408
                        exchangeDetail[property].response = res && res.body
                    })

                    if (config.successCallback) {
                        config.successCallback(_ctx, res)
                    }

                    assertResponse(res)

                    done();
                });
        } else {
            logExchangeDetail(_ctx.exchangeName, exchangeDetail => {
                exchangeDetail[property] = exchangeDetail[property] || {}
                exchangeDetail[property].statusCode = 'n/a'
            })
            if (!REPORT_ONLY) {
                this.skip()
            }
            done()
        }
    })
}

module.exports = {
    generateTest : generateTest
}