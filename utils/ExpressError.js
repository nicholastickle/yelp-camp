// Express error class which extends the existing express Error class. Adding on a statusCode and message that we can then customize for specific errors.

class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;