const config = require('./config.js');
const utils = require('./utils.js');

const Discord = require('discord.js');
const { disconnect } = require('process');

const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
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
            allEventsChannel.send({ embed: await utils.createEventPost(message.guild, event) });
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

client.on('error', err => { });

client.login(process.env.DISCORD_TOKEN);