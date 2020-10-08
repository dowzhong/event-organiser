const database = require('./database.js');

database.sequelize.sync({ force: process.argv.includes('-f'), alter: process.argv.includes('-a') })
    .then(() => database.sequelize.close());