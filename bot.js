const config = require('./config.js');
const utils = require('./utils.js');

const redis = require('./redis.js');

const Discord = require('discord.js');

const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('raw', async event => {
    if (!config.rawEvents[event.t]) return;

    const { d: data } = event;
    const user = client.users.cache.get(data.user_id);
    const channel = client.channels.cache.get(data.channel_id) || await user.createDM();

    if (channel.messages.cache.has(data.message_id)) return;

    const message = await channel.messages.fetch(data.message_id);

    const emojiKey = data.emoji.id || data.emoji.name;
    const reaction = message.reactions.cache.get(emojiKey);

    client.emit(config.rawEvents[event.t], reaction, user);
});

client.on('message', async message => {
    if (message.author.bot || !message.guild || !message.content.startsWith(config.prefix))
        return;

    const args = message.content.split(' ');
    const command = args.shift().toLowerCase().slice(config.prefix.length);

    if (command === 'newevent') {
        if (!args[0]) {
            message.reply('Please specify a valid name for this event.');
            return;
        }

        const eventName = args.join(' ');

        const conflictingEvents = await utils.getEvent({ name: eventName });
        if (conflictingEvents.length) {
            message.reply('An event with that name is already scheduled.');
            return;
        }

        try {
            await message.channel.send('At what time would this event be occuring?' +
                ' *Please format as DD/MM/YYYY HH:MM (24 hour time)*')
                .catch(err => { });

            const filter = msg => msg.author.id === message.author.id
                && msg.content.match(/^\d{1,2}\/\d{1,2}\/\d{4}\s\d{1,2}:\d{2}$/);

            const timeReply = await message.channel.awaitMessages(filter, {
                max: 1,
                time: 60 * 1000,
                errors: ['time']
            });
            const timeMsg = timeReply.first().content;

            const [dateString, time] = timeMsg.split(' ');
            const [day, month, year] = dateString.split('/');
            const [hour, minute] = time.split(':');
            const date = new Date();
            date.setFullYear(Number(year), Number(month) - 1, Number(day));
            date.setHours(hour, minute, 0, 0);
            await message.channel.send('Please give a short description of the event.')
                .catch(err => { });

            const descriptionReply = await message.channel.awaitMessages(m => m.author.id === message.author.id, {
                max: 1,
                time: 60 * 1000,
                errors: ['time']
            });

            const event = await utils.createEvent(message.guild, eventName, descriptionReply.first().content, date);

            const allEventsChannel = message.guild.channels.cache.find(channel => {
                return channel.parent
                    && channel.parent.name === 'Organized Events'
                    && channel.name === 'all-events'
            });

            const question = utils.findEmojiByName(client, 'question');
            const cross = utils.findEmojiByName(client, 'cross');
            const tick = utils.findEmojiByName(client, 'tick');
            const bin = utils.findEmojiByName(client, 'bin');

            const eventPost = await allEventsChannel.send({ embed: await utils.createEventPost(message.guild, event) });

            await utils.storeEventPost(eventPost, event);

            await eventPost.react(tick);
            await eventPost.react(cross);
            await eventPost.react(question);
            await eventPost.react(bin);
        } catch (err) {
            if (err instanceof Discord.Collection) {
                message.reply('event creation expired after inactivity.').catch(err => { });
                return;
            }
            if (err.name === 'SequelizeUniqueConstraintError') {
                message.reply('An event with that name is already scheduled.');
                return;
            }
            message.reply('An unknown error occured: ' + err.message);
            console.error(err);
        }
    }

    if (command === 'setutc') {
        try {
            const newUTC = Number(args[0]);
            await utils.setGuildUTCTimezone(message.guild, newUTC);
            message.reply(`This guild is now in UTC${newUTC > 0 ? '+' : ''}${newUTC}`)
        } catch (err) {
            message.reply('Could not update timezone: ' + err.message);
            console.error(err);
        }
    }

    if (command === 'setup') {
        utils.createEventChannels(message.guild);
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot || !reaction.message.guild) return;

    const correspondingEvent = await redis.getAsync(reaction.message.id);
    if (correspondingEvent === null) return;

    const [event] = await utils.getEvent({ id: correspondingEvent });

    if (!event) {
        await redis.delAsync(reaction.message.id);
        return;
    }

    if (reaction.emoji.name === 'bin') {
        await event.removeParticipant(user.id);
    } else if (config.emojiDecision[reaction.emoji.name])
        await event.addParticipant(user.id, config.emojiDecision[reaction.emoji.name]);


    await event.reload();

    reaction.message.edit({ embed: await utils.createEventPost(reaction.message.guild, event) }).catch(err => {
        console.error('Could not edit embed after updating member decision', err);
    });
    reaction.users.remove(user.id).catch(err => { });
});

client.on('error', err => { });

client.login(process.env.DISCORD_TOKEN);