module.exports = (sequelize, datatypes) => {
    return sequelize.define('eventPosts', {
        id: {
            type: datatypes.STRING,
            primaryKey: true
        }
    });
}