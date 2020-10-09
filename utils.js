const database = require('./database.js');
const { Permissions, MessageEmbed } = require('discord.js');

module.exports = {
    getGuild(guildId) {
        return database.Guilds.findCreateFind({
            where: {
                id: guildId
            }
        });
    },
    getEvent(query) {
        return database.Events.findAll({
            where: query
        });
    },
    async createEvent(guild, name, description, unparsedDate) {
        const [dbGuild] = await this.getGuild(guild.id);

        const date = this.localToServerTime(unparsedDate, dbGuild.utc_offset);

        // const date = new Date(unparsedDate.getTime());
        // date.setHours(date.getHours() + date.getTimezoneOffset() / 60 + dbGuild.utc_offset);
        const event = await database.Events.create({
            name,
            description,
            date,
        });
        return event;
    },
    async createEventChannels(guild) {
        const eventsCategory = await guild.channels.create('Organized Events', {
            type: 'category',
            reason: 'Event organiser bot.'
        });
        const eventsList = await guild.channels.create('All Events', {
            type: 'text',
            parent: eventsCategory,
            topic: 'All events!',
            permissionOverwrites: [{
                id: guild.id,
                deny: [Permissions.FLAGS.SEND_MESSAGES],
                type: 'role'
            }],
            reason: 'Event organiser bot.'
        });
    },
    setGuildUTCTimezone(guild, utc) {
        return database.Guilds.update({ utc_offset: utc }, {
            where: {
                id: guild.id
            }
        });
    },
    async createEventPost(guild, event) {
        const [dbGuild] = await this.getGuild(guild.id);
        return new MessageEmbed()
            .setColor(0x99EEBB)
            .setTitle(`${event.name} on ${this.serverToLocalTime(event.date, dbGuild.utc_offset).toLocaleString('en-GB')}`)
            .setDescription(event.description)
            .setTimestamp();
    },
    localToServerTime(date, utc) {
        const serverTime = new Date(date.getTime());
        serverTime.setHours(serverTime.getHours() + serverTime.getTimezoneOffset() / 60 + utc);
        return serverTime;
    },
    serverToLocalTime(date, utc) {
        const localised = new Date(date.getTime());
        localised.setHours(localised.getHours() + localised.getTimezoneOffset() / 60 + utc);
        return localised;
    }
}