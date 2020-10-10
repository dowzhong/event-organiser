require('dotenv').config();
const client = require('./bot.js');

const database = require('./database.js');
const utils = require('./utils.js');

async function init() {
    const futureEvents = await database.Events.findAll({
        where: {
            expired: false
        },
        include: 'participants'
    });
    futureEvents.forEach(event => {
        setTimeout(async () => {
            utils.expireEvent(await client.guilds.fetch(event.guildId), event)
                .catch(err => console.error(`Could not expire event ${event.id}`, err));
        }, event.date - Date.now() + 1000 * 60 * 60 * 24);
    });
}

client.once('ready', () => {
    init();
});