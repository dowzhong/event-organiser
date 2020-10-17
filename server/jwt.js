const jwt = require('jsonwebtoken');

module.exports = {
    asyncSign(payload) {
        return new Promise((resolve, reject) => {
            jwt.sign(payload, process.env.JWT_SECRET, (err, token) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(token);
            });
        });
    },
    asyncVerify(payload) {
        return new Promise((resolve, reject) => {
            jwt.verify(payload, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(decoded);
            });
        });
    }
};