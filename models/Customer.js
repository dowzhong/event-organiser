module.exports = (sequelize, datatypes) => {
    return sequelize.define('customer', {
        id: {
            type: datatypes.STRING,
            primaryKey: true
        },
        stripeCustomerId: {
            type: datatypes.STRING
        },
        premium: {
            type: datatypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    });
}