require('dotenv').config();
const { Client, MessageEmbed, Message } = require('discord.js');
const client = new Client();

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(client.guilds.cache.size);
    client.guilds.cache.forEach(async guild => {
        if (guild.id === '527437722416054282') {
            return;
        }
        console.log(guild.ownerID, guild.name);
        try {
            const owner = await guild.members.fetch(guild.ownerID);
            await owner.send({
                embed: new MessageEmbed()
                    .setColor(0x1FD537)
                    .setImage('https://media1.tenor.com/images/db3d52304dd91f9dab445cecefc884d5/tenor.gif?itemid=10592791')
                    .setTitle('2020/21 Christmas and New Years Sale!')
                    .setDescription(
                        'Merry Christmas and a Happy New Year to you! Event organizer bot will be ***50% off for 6 months!***' +
                        '\n\n' +
                        'Just apply promo code `CHRISTMAS2020` at checkout!' +
                        '\n\n\n' +
                        'Manage your plan [here](https://event-bot.weeb.tools/manage) or click on "Manage plan" under your profile at the top right.'
                    )
                    .setFooter('Offer redeemable until 31/01/2021')
            });
        } catch (err) {
            console.error('Could not send to', guild.id, guild.ownerId);
        }
    });
});

client.login(process.env.DISCORD_TOKEN);
