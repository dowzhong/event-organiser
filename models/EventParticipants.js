module.exports = (sequelize, datatypes) => {
    return sequelize.define('eventParticipants', {
        decision: {
            type: datatypes.ENUM('Going', 'Not Going', 'Unsure')
        }
    });
}
