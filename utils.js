const database = require('./database.js');
const { Permissions, MessageEmbed } = require('discord.js');

const redis = require('./redis.js');

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

        const event = await database.Events.create({
            name: name.trim(),
            description: description.trim(),
            date,
        });
        await event.setGuild(dbGuild);
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

        const question = guild.client.emojis.cache.find(emoji => emoji.name === 'question');
        const cross = guild.client.emojis.cache.find(emoji => emoji.name === 'cross');
        const tick = guild.client.emojis.cache.find(emoji => emoji.name === 'tick');

        return new MessageEmbed()
            .setColor(0x99EEBB)
            .setTitle(event.name)
            .setDescription(event.description)
            .addField('Time', this.serverToLocalTime(event.date, dbGuild.utc_offset).toLocaleString('en-GB'))
            .addField(`${tick} Going`, 'placeholder', true)
            .addField(`${cross} Not Going`, 'placeholder', true)
            .addField(`${question} Unsure`, 'placeholder', true)
            .setTimestamp();
    },
    localToServerTime(date, utc) {
        const serverTime = new Date(date.getTime());
        serverTime.setHours(serverTime.getHours() - utc - serverTime.getTimezoneOffset() / 60);
        return serverTime;
    },
    serverToLocalTime(date, utc) {
        const localised = new Date(date.getTime());
        localised.setHours(localised.getHours() + localised.getTimezoneOffset() / 60 + utc);
        return localised;
    },
    async storeEventPost(message, event) {
        const post = await database.EventPosts.create({
            id: message.id,
            eventId: event.id
        });
        await redis.setAsync(message.id, event.id);
        return post;
    }
}