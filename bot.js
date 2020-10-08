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

    if (command === 'createevent') {
        if (!args[0]) {
            message.reply('Please specify a valid name for this event.');
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
            date.setHours(hour, minute);

            const event = await utils.createEvent(message.guild, args.join(' '), date);
            console.log(event.date);
        } catch (err) {
            if (err instanceof Discord.Collection) {
                message.reply('event creation expired after inactivity.').catch(err => { });
                return;
            }
            if (err.name === 'SequelizeUniqueConstraintError') {
                message.reply('An event with that name is already scheduled.');
                return;
            }
            message.reply('An unknown error occured...');
            console.error(err);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);