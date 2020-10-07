module.exports = (sequelize, datatypes) => {
    return sequelize.define('participants', {
        name: {
            type: datatypes.STRING,
            allowNull: false,
            unique: true
        },
    });
}