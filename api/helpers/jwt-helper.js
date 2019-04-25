const jwt = require('jsonwebtoken')
    , path = require('path')
    , fs = require('fs');

const ccxtRestErrors = require('../errors')

// TODO : Move this to a database
const secretKey = (function() {
    const SECRET_KEY_PATH = path.join(__dirname, '../../.secret_key')
    if (!fs.existsSync(SECRET_KEY_PATH)) {
        fs.writeFileSync(SECRET_KEY_PATH, Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    }
    return fs.readFileSync(SECRET_KEY_PATH);
})()

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