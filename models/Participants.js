module.exports = (sequelize, datatypes) => {
    return sequelize.define('participants', {
        id: {
            type: datatypes.STRING,
            primaryKey: true
        },
        decision: {
            type: datatypes.ENUM('Going', 'Not Going', 'Unsure')
        }
    });
}
