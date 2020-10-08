const Sequelize = require('sequelize');

const sequelize = new Sequelize('event-organiser', process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'postgres',
    logging: false
});

const Events = require('./models/Events.js')(sequelize, Sequelize.DataTypes);
const Guilds = require('./models/Guilds.js')(sequelize, Sequelize.DataTypes);
const Participants = require('./models/Participants.js')(sequelize, Sequelize.DataTypes);

module.exports = { 
    Events,
    Guilds,
    Participants,
    sequelize 
};