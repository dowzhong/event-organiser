module.exports = (sequelize, datatypes) => {
    return sequelize.define('guilds', {
        id: {
            type: datatypes.STRING,
            primaryKey: true
        },
        utc_offset: {
            type: datatypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    });
}