const jwt = require('../jwt.js');

module.exports = async (req, res, next) => {
    let token;
    if (req.method === 'POST')
        token = req.body.token;
    if (req.method === 'GET')
        token = req.query.token;

    if (!token) {
        res.status(403).json({
            success: false,
            content: 'Invalid or missing token.'
        });
        return;
    }
    req.user = await jwt.asyncVerify(token);
    next();
}