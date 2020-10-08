const Sequelize = require('sequelize');

const sequelize = new Sequelize('event-organiser', process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'postgres',
    logging: false
});

const Events = require('./models/Events.js')(sequelize, Sequelize.DataTypes);
const Guilds = require('./models/Guilds.js')(sequelize, Sequelize.DataTypes);
const Participants = require('./models/Participants.js')(sequelize, Sequelize.DataTypes);

Events.belongsTo(Guilds);
Guilds.hasMany(Events);

Events.belongsToMany(Participants, { through: 'Event_Participants' });
Participants.belongsToMany(Events, { through: 'Event_Participants' });

module.exports = {
    Events,
    Guilds,
    Participants,
    sequelize
};