class UserError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class InternalError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports.UserError = UserError;
module.exports.InternalError = InternalError;