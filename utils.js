const database = require('./database.js');

module.exports = {
    getGuild(guildId) {
        return database.Guilds.findCreateFind({
            where: {
                id: guildId
            }
        });
    },
    async createEvent(guild, name, unparsedDate) {
        const [dbGuild] = await this.getGuild(guild.id);

        const date = new Date(unparsedDate.getTime());
        date.setHours(date.getHours() - date.getTimezoneOffset() / 60 + dbGuild.utc_offset);
        try {
            const event = await database.Events.create({
                name,
                date
            });
            return event;
        } catch (err) {
            console.error(err);
        }
    },
    async createEventChannels(guild) {
        guild.channels.create('events')
    }
}