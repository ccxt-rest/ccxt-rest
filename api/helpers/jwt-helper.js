const jwt = require('jsonwebtoken')
;

const db = require('../models')

const ccxtRestErrors = require('../errors')

let secretKey;
function initialize() {
    const jwtDataErrorHandler = (error) => {
        console.error('Error finding JWT Data')
        console.trace(error)
        process.exit(1)
    }
    return db.JwtData.findOne()
        .then(jwtData => {
            if (!jwtData) {
                const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
                return db.JwtData.create({
                    secret:secret
                }).then(jwtData => {
                    secretKey = jwtData.secret
                }).catch(jwtDataErrorHandler)
            } else {
                secretKey = jwtData.secret
            }
        }).catch(jwtDataErrorHandler)
}

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
    initialize: initialize,
    decode : decode,
    sign : sign
}