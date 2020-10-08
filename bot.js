const config = require('./config.js');

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    if (message.author.bot || !message.guild || !message.content.startsWith(config.prefix))
        return;

    const args = message.content.split(' ');
    const command = args.shift().toLowerCase().slice(config.prefix.length);

    
});

client.login(process.env.DISCORD_TOKEN);