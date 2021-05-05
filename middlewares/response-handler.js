const ResponseManager = require('../managers/response-manager');

module.exports = (req, res, next) => {
    res.onSuccess = (data, message, code) => {
        ResponseManager.respondWithSuccess(res, code || 200, data, message);
    }
    res.onError = (error, data) => {
        if (error instanceof Error && !data && process.env.NODE_ENV === 'development') {
            data = JSON.stringify(error, Object.getOwnPropertyNames(error));
        }
        ResponseManager.respondWithError(res, error.httpStatus || 500, error.message || 'Unknown error', data);
    }
    next();
};
