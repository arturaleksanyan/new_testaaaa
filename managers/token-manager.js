const jwt = require('jsonwebtoken');
const config = require('../configs/jwt');

class TokenManager {
    static encode(data, expiresIn = 60 * 60 * 24) {
        return jwt.sign(data, config.privateKey, {
            expiresIn
        });
    }

    static async decode(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, config.privateKey, function (err, decoded) {
                if (err) {
                    return reject(err);
                }
                resolve(decoded);
            });
        })
    }
}

module.exports = TokenManager;
