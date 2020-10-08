module.exports = (sequelize, datatypes) => {
    return sequelize.define('events', {
        name: {
            type: datatypes.STRING,
            allowNull: false,
            unique: true
        },
        date: {
            type: datatypes.DATE,
            allowNull: false
        }
    });
}
