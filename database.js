const Sequelize = require('sequelize');

const sequelize = new Sequelize('event-organiser', process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'postgres',
    logging: false
});

module.exports = { sequelize };