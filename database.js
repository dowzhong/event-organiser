const Sequelize = require('sequelize');

const sequelize = new Sequelize('event-organiser', process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'postgres',
    logging: false
});

const Customers = require('./models/Customers.js')(sequelize, Sequelize.DataTypes);
const EventParticipants = require('./models/EventParticipants.js')(sequelize, Sequelize.DataTypes);
const EventPosts = require('./models/EventPosts.js')(sequelize, Sequelize.DataTypes);
const Events = require('./models/Events.js')(sequelize, Sequelize.DataTypes);
const Guilds = require('./models/Guilds.js')(sequelize, Sequelize.DataTypes);
const Participants = require('./models/Participants.js')(sequelize, Sequelize.DataTypes);

EventPosts.belongsTo(Events);
Events.hasOne(EventPosts);

Events.belongsTo(Guilds);
Guilds.hasMany(Events);

Events.belongsToMany(Participants, { through: EventParticipants });
Participants.belongsToMany(Events, { through: EventParticipants });

Events.prototype.addParticipant = async function (id, decision) {
    const [participant] = await Participants.findCreateFind({
        where: { id }
    });
    await participant.addEvent(this.id, { through: { decision } });
    return Events;
}

Events.prototype.deleteParticipant = async function (id, decision) {
    const participant = await Participants.findOne({
        where: { id }
    });
    if (!participant) return Event;

    await this.removeParticipant(participant);
    return Events;
}

module.exports = {
    Customers,
    EventPosts,
    Events,
    Guilds,
    Participants,
    sequelize,
    Sequelize
};