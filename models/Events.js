module.exports = (sequelize, datatypes) => {
    return sequelize.define('events', {
        name: {
            type: datatypes.STRING,
            allowNull: false,
            unique: true
        },
        description: {
            type: datatypes.STRING,
            allowNull: false
        },
        date: {
            type: datatypes.DATE,
            allowNull: false
        }
    });
}
