require('dotenv').config();
const client = require('./bot.js');

const database = require('./database.js');
const utils = require('./utils.js');

const schedule = require('node-schedule');

client.once('ready', () => {
    schedule.scheduleJob('0 0 * * *', async () => {
        const events = await utils.getAllEvents({
            expired: false,
            date: {
                [database.Sequelize.Op.lt]: Date.now()
            }
        });
        events.forEach(async event => {
            const guild = await client.guilds.fetch(event.guildId).catch(err => null);
            utils.expireEvent(guild, event.id).catch(err => console.error(`Could not expire event ${event.id}`, err));
        });
    });
})