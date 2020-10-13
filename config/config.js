require('dotenv').config();

module.exports = {
    "development": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASS,
        "database": "event-organiser",
        "host": "127.0.0.1",
        "dialect": "postgres"
    },
    "test": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASS,
        "database": "event-organiser",
        "host": "127.0.0.1",
        "dialect": "postgres"
    },
    "production": {
        "username": process.env.DB_USER,
        "password": process.env.DB_PASS,
        "database": "event-organiser",
        "host": "127.0.0.1",
        "dialect": "postgres"
    }
};
