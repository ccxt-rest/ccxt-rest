const path = require('path')
    , fs = require('fs');

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

module.exports = {
    algorithm : ALGORITHM,
    secretKey : secretKey,
    issuer : ISSUER
}