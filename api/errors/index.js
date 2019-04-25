'use strict';

class AuthError extends Error {
    constructor(message) {
        super(message)
    }
}

module.exports = {
    AuthError : AuthError
}