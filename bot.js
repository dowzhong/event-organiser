const config = require('./config.js');
const utils = require('./utils.js');

const redis = require('./redis.js');

const Discord = require('discord.js');
const { MessageEmbed } = require('discord.js');
const { delAsync } = require('./redis.js');
const database = require('./database.js');

const client = new Discord.Client();

const awaitingMessage = new Set();

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(await client.generateInvite(8));
});

client.on('raw', async event => {
    if (!config.rawEvents[event.t]) return;

    const { d: data } = event;
    const user = client.users.cache.get(data.user_id);
    const channel = client.channels.cache.get(data.channel_id) || await user.createDM();

    if (channel.messages.cache.has(data.message_id)) return;

    const message = await channel.messages.fetch(data.message_id).catch(() => null);

    if (!message) {
        return;
    }

    const emojiKey = data.emoji.id || data.emoji.name;
    const reaction = message.reactions.cache.get(emojiKey);

    client.emit(config.rawEvents[event.t], reaction, user);
});

client.on('message', async message => {
    if (message.author.bot
        || !message.guild
        || !message.content.startsWith(config.prefix)
        || awaitingMessage.has(message.author.id))
        return;

    if (utils.getRoleByName(message.guild.roles.cache, 'Event Organiser')
        && !utils.getRoleByName(message.member.roles.cache, 'Event Organiser')) {
        return;
    }

    const args = message.content.split(' ');
    const command = args.shift().toLowerCase().slice(config.prefix.length);

    if (command === 'help') {
        message.channel.send({
            embed: new MessageEmbed()
                .setDescription('Hey there! You can check out my commands [here](https://event-bot.weeb.tools/commands).')
                .setColor(config.colors.active)
        }).catch(err => { });
    }

    if (command === 'delete') {
        if (!args.length) {
            await message.reply({
                embed: new MessageEmbed()
                    .setDescription(`Please use the command like: \`${config.prefix}delete {event id}\``)
                    .addField('Example',
                        `${config.prefix}delete 13`)
                    .setColor(config.colors.orangeError)
            })
                .catch(err => { });
            return;
        }

        const eventId = Number(args[0]);
        if (!eventId) {
            message.reply({
                embed: new MessageEmbed()
                    .setDescription(`Invalid event ID: ${eventId}`)
                    .setColor(config.colors.orangeError)
            })
                .catch(err => { });
            return;
        }
        const deleted = await utils.deleteGuildEvent(message.guild, eventId);
        if (!deleted) {
            message.reply({
                embed: new MessageEmbed()
                    .setDescription(`No event with id ${eventId} was found...`)
                    .setColor(config.colors.orangeError)
            })
                .catch(err => { });
            return;
        }
        message.reply('Event deleted.').catch(err => { });
    }

    if (command === 'edit') {
        if (args.length < 3) {
            await message.reply({
                embed: new MessageEmbed()
                    .setDescription(`Please use the command like: \`${config.prefix}edit {event id} {name|date|description} {new info}\``)
                    .addField('Example',
                        `${config.prefix}edit 13 name New Event Name
                        ${config.prefix}edit 13 date 20/10/2021 13:00
                        ${config.prefix}edit 13 description New Description`)
                    .setColor(config.colors.orangeError)
            })
                .catch(err => { });
            return;
        }
        const eventId = Number(args[0]);
        const field = args[1].toLowerCase();
        const info = args.splice(2).join(' ');

        if (!['name', 'date', 'description'].includes(field)) {
            await message.reply({
                embed: new MessageEmbed()
                    .setTitle(`2nd argument (field) must be one of \`name, date, description\`.`)
                    .addField('Example',
                        `${config.prefix}edit 13 name New Event Name
                        ${config.prefix}edit 13 date 20/10/2021 13:00
                        ${config.prefix}edit 13 description New Description`)
                    .setColor(config.colors.orangeError)
            })
                .catch(err => { });
            return;
        }

        const event = await utils.getEvent({ id: eventId, guildId: message.guild.id, expired: false });
        if (!event) {
            await message.reply({
                embed: new MessageEmbed()
                    .setDescription(`No ongoing event with id ${eventId} was found...`)
                    .setColor(config.colors.orangeError)
            })
                .catch(err => { });
            return;
        }

        if (field === 'date' && !utils.validDate(info)) {
            await message.reply({
                embed: new MessageEmbed()
                    .setTitle(`Invalid date format. Use \`DD/MM/YYYY HH:MM\``)
                    .addField('Date Example',
                        `24/12/2020 13:00
                        12/3/2020 9:00`)
                    .setColor(config.colors.orangeError)
            })
                .catch(err => { });
            return;
        }

        if (field === 'name' && event.name === info) {
            await message.reply({
                embed: new MessageEmbed()
                    .setDescription(`Another event with this name already exists.`)
                    .setColor(config.colors.orangeError)
            })
                .catch(err => { });
            return;
        }

        try {
            await utils.editEvent(event, field, info);

            const { allEvents } = utils.getEventsChannels(message.guild);
            if (!allEvents) return;

            const post = await event.getEventPost();

            const postedEvent = await allEvents.messages.fetch(post.id);
            if (!postedEvent) return;

            await postedEvent.edit({ embed: await utils.createEventPost(message.guild, event) });
            message.reply('Event edited.').catch(err => { });
        } catch (err) {
            if (err.httpStatus !== 404) {
                await message.reply({
                    embed: new MessageEmbed()
                        .setTitle(`Unexpected error occured: ${err.message}`)
                        .setColor(config.colors.redError)
                })
                    .catch(err => { });
            }
        }
    }

    if (command === 'new') {
        if (!args[0]) {
            message.reply('Please specify a valid name for this event.');
            return;
        }

        const eventName = args.join(' ').trim();

        const conflictingEvent = await utils.getEvent({ name: eventName, guildId: message.guild.id, expired: false });
        if (conflictingEvent) {
            message.reply('An event with that name is already scheduled.');
            return;
        }

        try {
            awaitingMessage.add(message.author.id);

            await message.reply({
                embed: new MessageEmbed()
                    .setDescription('At what time would this event be occuring?' +
                        ' *Please format as DD/MM/YYYY HH:MM (24 hour time)*')
                    .addField('Example', '25/12/2020 17:00')
                    .setColor(config.colors.example)
            })
                .catch(err => { });

            const filter = msg => msg.author.id === message.author.id
                && utils.validDate(msg.content);

            const timeReply = await message.channel.awaitMessages(filter, {
                max: 1,
                time: config.botMessageTimeout,
                errors: ['time']
            });
            const timeMsg = timeReply.first();
            if (!timeMsg) {
                message.reply('An unknown error occured...please try again.').catch(err => { });
                return;
            }
            const timeMsgContent = timeMsg.content;
            const date = utils.dateFromString(timeMsgContent);

            await message.reply({
                embed: new MessageEmbed()
                    .setDescription('Please give a short description of the event.')
                    .addField('Example', 'We\'ll be singing Christmas carols or something.')
                    .setColor(config.colors.example)
            })
                .catch(err => { });

            const descriptionReply = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
                max: 1,
                time: config.botMessageTimeout,
                errors: ['time']
            });

            awaitingMessage.delete(message.author.id);

            const statusMsg = await message.reply('*Creating event...*');
            const event = await utils.createEvent(
                message.guild,
                message.author.id,
                eventName,
                descriptionReply.first().content,
                date
            );

            const premium = await utils.getGuildPremiumStatus(message.guild);
            if (premium) {
                await createEventRoles(message.guild, event)
                    .catch(err => console.error('Could not create event role', eventName, err));
            }

            await createGuildEvent(message.guild, event, descriptionReply.first().content, date);

            statusMsg.edit(`${message.author}, New event ***${event.name}*** created! ` +
                `\nBy default, anyone can create or edit events. To lock this, create a role called \`Event Organiser\` and assign it accordingly.`)
                .catch(err => { });
        } catch (err) {
            awaitingMessage.delete(message.author.id);
            utils.deleteEvent({ guildId: message.guild.id, name: eventName }).catch(err => { });
            if (err instanceof Discord.Collection) {
                message.reply('Event creation expired after inactivity.').catch(err => { });
                return;
            }
            if (err.name === 'SequelizeUniqueConstraintError') {
                message.reply('An event with that name is already scheduled.');
                return;
            }
            message.reply('An error occured: ' + err.message);

            if (!(err instanceof Discord.DiscordAPIError))
                console.error(err);
        }
    }

    if (command === 'setutc') {
        try {
            const newUTC = Number(args[0]);
            await utils.setGuildUTCTimezone(message.guild, newUTC);
            message.reply(`This guild is now in UTC${newUTC > 0 ? '+' : ''} ${newUTC} `)
        } catch (err) {
            message.reply('Could not update timezone: ' + err.message);
            console.error(err);
        }
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (!user || user.bot || !reaction.message.guild) return;

    const correspondingEvent = await redis.getAsync(reaction.message.id);
    if (correspondingEvent === null) return;

    const event = await utils.getEvent({ id: correspondingEvent, guildId: reaction.message.guild.id });

    if (!event) {
        await redis.delAsync(reaction.message.id);
        return;
    }
    if (!event.expired) {
        const reactionMember = await reaction.message.guild.members.fetch(user.id);
        const reactAction = config.emojiDecision[reaction.emoji.id];

        if (reaction.emoji.name === 'bin') {
            await event.removeParticipant(user.id);
            if (event.roleId) {
                await reactionMember.roles.remove(event.roleId, 'Reacted to event.')
                    .catch(err => console.error('Could not add event role to user', err));
            }
        } else if (reactAction) {
            await event.addParticipant(user.id, reactAction);
            if (event.roleId) {
                try {
                    if (reactAction === 'Going') {
                        await reactionMember.roles.add(event.roleId, 'Reacted to event.')
                            .catch(err => {
                                if (!(err instanceof Discord.DiscordAPIError))
                                    console.error('Could not add event role to user', err);
                            });
                    }
                    else {
                        await reactionMember.roles.remove(event.roleId, 'Reacted to event.')
                            .catch(err => {
                                if (!(err instanceof Discord.DiscordAPIError))
                                    console.error('Could not remove event role to user', err);
                            });
                    }
                } catch (err) {
                    if (err.httpStatus !== 404)
                        console.error(`Error fetching member: `, err);
                }
            }
        }

        await event.reload();

        reaction.message.edit({ embed: await utils.createEventPost(reaction.message.guild, event) }).catch(err => {
            console.error('Could not edit embed after updating member decision', err);
        });
    }

    reaction.users.remove(user.id).catch(err => { });
});

client.on('guildCreate', guild => {
    if (!guild.owner) return;

    guild.owner.send({
        embed: new MessageEmbed()
            .setDescription(`Hey there! I have just been added to ${guild.name}. `
                + `Please set the timezone for your server with \`${config.prefix}setutc {offset}\` \neg \`${config.prefix}setutc 11\` \nbefore you create any events.`)
            .addField('Manage your plan and check out my commands:', 'https://event-bot.weeb.tools')
            .setColor(config.colors.active)
    }).catch(err => { });
});

client.on('error', err => { });

client.login(process.env.DISCORD_TOKEN);

async function createGuildEvent(guild, event) {
    let { allEvents } = utils.getEventsChannels(guild);
    if (!allEvents)
        allEvents = (await utils.createEventChannels(guild)).allEvents;

    const question = utils.findEmojiByName(client, 'question');
    const cross = utils.findEmojiByName(client, 'cross');
    const tick = utils.findEmojiByName(client, 'tick');
    const bin = utils.findEmojiByName(client, 'bin');

    const eventPost = await allEvents.send({ embed: await utils.createEventPost(guild, event) });

    await utils.storeEventPost(eventPost, event);

    await eventPost.react(tick);
    await eventPost.react(cross);
    await eventPost.react(question);
    await eventPost.react(bin);
}

async function createEventRoles(guild, event) {
    const role = await guild.roles.create({
        data: {
            name: utils.truncate(event.name)
        },
        reason: `For event: ${event.name} `
    });
    event.roleId = role.id;
    await event.save();
    return;
}

module.exports = client;
