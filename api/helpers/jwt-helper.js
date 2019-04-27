const fs = require('fs')
    , jwt = require('jsonwebtoken')
    , path = require('path')
;

const db = require('./db')

const ccxtRestErrors = require('../errors')

const secretKey = db.getSecretKey()

const ISSUER = 'CCXT REST'
const ALGORITHM = 'HS256'

function sign(exchangeName, exchangeId, callback) {
    jwt.sign(
        { iss: ISSUER, sub: exchangeId, exchange: exchangeName }, 
        secretKey, 
        { algorithm: ALGORITHM }, 
        callback);
}

function decode(token) {
    try {
        const decoded = jwt.verify(token, secretKey);
        if (decoded.iss != ISSUER) {
            throw new ccxtRestErrors.AuthError(`Invalid issuer ${decoded.iss}`)
        }
        return decoded      
    } catch (error) {
        console.trace(error)
        throw new ccxtRestErrors.InvalidTokenError(`Invalid token ${token}`)
    }
}

module.exports = {
    decode : decode,
    sign : sign
}