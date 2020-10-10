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
            where: query,
            include: 'participants',
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
        await event.setDataValue('participants', await event.getParticipants());
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

        const question = this.findEmojiByName(guild.client, 'question');
        const cross = this.findEmojiByName(guild.client, 'cross');
        const tick = this.findEmojiByName(guild.client, 'tick');

        const going = await this.getNicknamesByDecision(guild, event, 'Going');
        const notGoing = await this.getNicknamesByDecision(guild, event, 'Not Going');
        const unsure = await this.getNicknamesByDecision(guild, event, 'Unsure');

        return new MessageEmbed()
            .setColor(0x99EEBB)
            .setTitle(event.name)
            .setDescription(event.description)
            .addField('Time', this.serverToLocalTime(event.date, dbGuild.utc_offset).toLocaleString('en-GB'))
            .addField(`${tick} Going`, going.join('\n') || '-', true)
            .addField(`${cross} Not Going`, notGoing.join('\n') || '-', true)
            .addField(`${question} Unsure`, unsure.join('\n') || '-', true)
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
    },
    findEmojiByName(client, name) {
        return client.emojis.cache.find(emoji => emoji.name === name);
    },
    filterParticipants(event, status) {
        return event.getDataValue('participants').filter(participant => participant.eventParticipants.decision === status);
    },
    getNicknamesByDecision(guild, event, decision) {
        const participants = event.participants.filter(participant => participant.eventParticipants.decision === decision);
        return this.getNicknameFromParticipants(guild, participants);
    },
    async getNicknameFromParticipants(guild, participants) {
        const nicknames = await Promise.all(
            participants.map(p => {
                return this.getNicknameFromId(guild, p.id).catch(err => null);
            })
        );
        return nicknames.filter(Boolean);
    },
    async getNicknameFromId(guild, id) {
        try {
            const member = await guild.members.fetch(id);
            return member.displayName;
        } catch (err) {
            if (err.httpStatu === 404)
                return null;
            throw err;
        }
    }
}