require('dotenv').config();
const client = require('./bot.js');

const { MessageEmbed, Message } = require('discord.js');

const config = require('./config.js');
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

    schedule.scheduleJob('0 13 * * *', async () => {
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
            const { eventTalk, allEvents } = utils.getEventsChannels(guild);

            const post = await event.getEventPost();
            const postedEvent = await allEvents.messages.fetch(post.id).catch(err => null);

            const reminder = new MessageEmbed()
                .setTitle(`Hey peeps, just a reminder that your event* **${event.name}*** is coming up tomorrow!`)
                .addField('Event', `**[Link](${postedEvent ? postedEvent.url : '-'})**`)
                .setColor(config.colors.active)

            eventTalk.send(`<@&${event.roleId}>`, { embed: reminder })
                .catch(err => { });
        });
    });
});