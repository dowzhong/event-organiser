require('dotenv').config();

const jwt = require('./jwt.js');
const request = require('superagent');
const express = require('express');
const app = express();

const helmet = require('helmet');
const cors = require('cors');

const bodyParser = require('body-parser');

app.use(cors());
app.use(helmet());

app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/stripe/webhook')) {
        bodyParser.raw({ type: 'application/json' })(req, res, next);
        return;
    }
    bodyParser.json()(req, res, next);
});
app.use(bodyParser.urlencoded({
    extended: true
}));

const hasToken = require('./middleware/hasToken.js');

app.use('/stripe', require('./router/stripe.js'));

app.get('/auth', async (req, res) => {
    if (req.query.error) {
        res.status(400).redirect(process.env.FRONTEND + `/?error=${req.query.error_description}`);
        return;
    }
    if (!req.query.code) {
        res.status(400).end();
        return;
    }
    try {
        const response = await request
            .post('https://discord.com/api/oauth2/token')
            .send({
                client_id: process.env.DISCORD_CLIENT,
                client_secret: process.env.DISCORD_SECRET,
                grant_type: 'authorization_code',
                code: req.query.code,
                redirect_uri: 'https://4121f7f0fc66.ngrok.io/auth',
                scope: 'identify email guilds'
            })
            .type('form');

        const { body: user } = await request
            .get('https://discord.com/api/users/@me')
            .set('Authorization', `${response.body.token_type} ${response.body.access_token}`);

        const token = await jwt.asyncSign(user);
        res.redirect(process.env.FRONTEND + '/?token=' + token);
    } catch (err) {
        console.error(err);
        res.redirect(process.env.FRONTEND + `/?error=${err}`);
    }
});

app.get('/getUser', hasToken, async (req, res) => {
    try {
        res.json({
            success: true,
            content: req.user
        });
    } catch (err) {
        res.status(403).json({
            success: false,
            content: 'Invalid token'
        });
    }
});

app.use(function (err, req, res, next) {
    console.error(err);
    res.status(500).send('Something broke!');
});


app.listen(process.env.SERVER_PORT, () => console.log('Listening on', process.env.SERVER_PORT));