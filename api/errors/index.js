'use strict';

class AuthError extends Error {
    constructor(message) {
        super(message)
    }
}

class InvalidTokenError extends AuthError {
    constructor(message) {
        super(message)
    }
}

class MissingRequiredTokenError extends AuthError {
    constructor(message) {
        super(message)
    }
}

class UnknownExchangeNameError extends Error {
    constructor(message) {
        super(message)
    }
}

class UnsupportedApiError extends Error {
    constructor(message) {
        super(message)
    }
}


class BrokenExchangeError extends Error {
    constructor(message) {
        super(message)
    }
}

module.exports = {
    AuthError : AuthError, 
    BrokenExchangeError : BrokenExchangeError,
    InvalidTokenError : InvalidTokenError,
    MissingRequiredTokenError : MissingRequiredTokenError,
    UnknownExchangeNameError : UnknownExchangeNameError,
    UnsupportedApiError : UnsupportedApiError
}