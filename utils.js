const config = require('./config.js');
const database = require('./database.js');
const { Permissions, MessageEmbed } = require('discord.js');

const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];

const redis = require('./redis.js');

module.exports = {
    async getGuildPremiumStatus(guild) {
        const customer = await database.Customers.findOne({
            where: {
                id: guild.ownerID
            }
        });
        if (!customer || !customer.premium) return false;
        return true;
    },
    getGuild(guildId) {
        return database.Guilds.findCreateFind({
            where: {
                id: guildId
            }
        });
    },
    getAllEvents(where) {
        return database.Events.findAll({
            where,
            include: 'participants'
        });
    },
    getEvent(query) {
        return database.Events.findOne({
            where: query,
            include: 'participants'
        });
    },
    async deleteGuildEvent(guild, eventId) {
        const event = await this.getEvent({
            id: eventId
        });
        if (!event) return null;

        const eventPost = await event.getEventPost();

        const eventRole = await guild.roles.fetch(event.roleId);
        if (eventRole) eventRole.delete('Event deleted.').catch(err => { });

        if (eventPost) {
            const { allEvents } = await this.getEventsChannels(guild);
            if (allEvents) {
                const eventMessage = await allEvents.messages.fetch(eventPost.id).catch(err => null);
                if (eventMessage) eventMessage.delete().catch(err => { });
            }
        }

        return event.destroy();
    },
    async expireEvent(guild, eventId) {
        const event = await this.getEvent({ id: eventId });
        if (!event) return;

        event.expired = true;
        await event.save();

        if (!guild) return;

        try {
            const eventRole = await guild.roles.fetch(event.roleId);
            await eventRole.delete('Event expired.');
        } catch (err) { }

        const { allEvents } = this.getEventsChannels(guild);
        if (!allEvents) return;

        const post = await event.getEventPost();

        const postedEvent = await allEvents.messages.fetch(post.id).catch(err => null);
        if (!postedEvent) return;

        postedEvent.edit({ embed: await this.createEventPost(guild, event) });
        postedEvent.reactions.removeAll();
    },
    async createEvent(guild, createdBy, name, description, unparsedDate) {
        const [dbGuild] = await this.getGuild(guild.id);
        const date = this.localToServerTime(unparsedDate, dbGuild.utc_offset);
        const event = await database.Events.create({
            name: name.trim(),
            description: description.trim(),
            date,
            createdBy
        });
        await event.setGuild(dbGuild);
        await event.setDataValue('participants', await event.getParticipants());
        return event;
    },
    async editEvent(event, field, data) {
        if (field === 'date') {
            const guild = await event.getGuild();
            const date = this.dateFromString(data);
            event.date = this.localToServerTime(date, guild.utc_offset);
            return event.save();
        }
        event[field] = data;
        return event.save();
    },
    async deleteEvent(event) {
        return database.Events.destroy({
            where: {
                id: event.id
            }
        });
    },
    async createEventChannels(guild) {
        const eventsCategory = await guild.channels.create('Organized Events', {
            type: 'category',
            reason: 'Event organiser bot.'
        });
        const allEvents = await guild.channels.create('All Events', {
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
        const eventTalk = await guild.channels.create('event-talk', {
            type: 'text',
            parent: eventsCategory,
            topic: 'Discuss and talk about upcoming/past events.',
            reason: 'Event organiser bot.'
        });

        return {
            allEvents,
            eventTalk
        };
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

        const creator = await this.getNicknameFromId(guild, event.createdBy).catch(err => '-');

        const eventDate = this.serverToLocalTime(event.date, dbGuild.utc_offset);
        const eventDateString = `${days[eventDate.getDay()]}, ${eventDate.toLocaleString('en-GB').slice(0, -3)}`;

        return new MessageEmbed()
            .setColor(event.expired ? config.colors.expired : config.colors.active)
            .setTitle(this.truncate(`[${event.id}] ${event.name}`, 256))
            .setDescription(this.truncate(event.description, 2048))
            .addField('Time', eventDateString)
            .addField(`${tick} Going (${going.length})`, this.truncate(going.join('\n') || '-', 1024), true)
            .addField(`${cross} Not Going (${notGoing.length})`, this.truncate(notGoing.join('\n') || '-', 1024), true)
            .addField(`${question} Unsure (${unsure.length})`, this.truncate(unsure.join('\n') || '-', 1024), true)
            .setFooter(`Let others know if you\'re coming by reacting - Event by ${creator}`)
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
    async getNicknamesByDecision(guild, event, decision) {
        const participants = event.getDataValue('participants').filter(participant => participant.eventParticipants.decision === decision);
        return (await this.getNicknameFromParticipants(guild, participants)).sort();
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
            if (err.httpStatus === 404)
                return null;
            throw err;
        }
    },
    getEventsChannels(guild) {
        return {
            allEvents: this.getOrganizedEventsChannel(guild, 'all-events'),
            eventTalk: this.getOrganizedEventsChannel(guild, 'event-talk')
        };
    },
    getOrganizedEventsChannel(guild, name) {
        return guild.channels.cache.find(channel => {
            return channel.parent
                && channel.parent.name === 'Organized Events'
                && channel.name === name
        });
    },
    truncate(string, length = 30) {
        if (string.length <= length) return string;

        return string.slice(0, length - 3) + '...';
    },
    validDate(string) {
        return !!string.match(/^\d{1,2}\/\d{1,2}\/\d{4}\s\d{1,2}:\d{2}$/);
    },
    dateFromString(timeMsg) {
        const [dateString, time] = timeMsg.split(' ');
        const [day, month, year] = dateString.split('/');
        const [hour, minute] = time.split(':');
        const date = new Date();
        date.setFullYear(Number(year), Number(month) - 1, Number(day));
        date.setHours(hour, minute, 0, 0);

        return date;
    },
    getRoleByName(roleCache, roleName) {
        return roleCache.find(role => role.name === roleName);
    }
}
