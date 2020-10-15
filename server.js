require('dotenv').config();

const request = require('superagent');
const app = require('express')();

const helmet = require('helmet');
const cors = require('cors');

const bodyParser = require('body-parser');

app.use(cors());
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

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
                redirect_uri: 'https://48b7a0c98b1c.ngrok.io/auth',
                scope: 'identify email guilds'
            })
            .type('form');
        res.redirect(process.env.FRONTEND + `/?token=${response.body.access_token}&refresh=${response.body.refresh_token}`
            + `&type=${response.body.token_type}`);
    } catch (err) {
        console.error(err);
        res.redirect(process.env.FRONTEND + `/?error=${err}`);
    }
});



app.listen(process.env.SERVER_PORT, () => console.log('Listening on', process.env.SERVER_PORT));