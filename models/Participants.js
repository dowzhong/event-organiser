module.exports = (sequelize, datatypes) => {
    return sequelize.define('participants', {
        id: {
            type: datatypes.STRING,
            primaryKey: true
        }
    });
}
