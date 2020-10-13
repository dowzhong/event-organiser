require('dotenv').config();
const client = require('./bot.js');

const database = require('./database.js');
const utils = require('./utils.js');

const schedule = require('node-schedule');

client.once('ready', async () => {
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
    const tomorrowStart = new Date();
    tomorrowStart.setHours(0, 0, 0, 0);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    const tomorrowEnd = new Date();
    tomorrowEnd.setHours(0, 0, 0, 0);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 2);

    const events = await utils.getAllEvents({
        expired: false,
        date: {
            [database.Sequelize.Op.between]: [tomorrowStart, tomorrowEnd]
        }
    });

    events.forEach(async event => {
        const guild = await client.guilds.fetch(event.guildId).catch(err => null);
        if (!guild) return;
        const { eventTalk } = utils.getEventsChannels(guild);
        eventTalk.send(`Hey <@&${event.roleId}>, just a reminder that your event is coming up tomorrow!`)
            .catch(err => {
                console.error(err);
            });
    });
});