const Sequelize = require('sequelize');

const sequelize = new Sequelize('event-organiser', process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'postgres',
    logging: false
});

const EventPosts = require('./models/EventPosts.js')(sequelize, Sequelize.DataTypes);
const Events = require('./models/Events.js')(sequelize, Sequelize.DataTypes);
const Guilds = require('./models/Guilds.js')(sequelize, Sequelize.DataTypes);
const Participants = require('./models/Participants.js')(sequelize, Sequelize.DataTypes);

EventPosts.belongsTo(Events);
Events.hasOne(EventPosts);

Events.belongsTo(Guilds);
Guilds.hasMany(Events);

Events.belongsToMany(Participants, { through: 'Event_Participants' });
Participants.belongsToMany(Events, { through: 'Event_Participants' });

module.exports = {
    EventPosts,
    Events,
    Guilds,
    Participants,
    sequelize
};