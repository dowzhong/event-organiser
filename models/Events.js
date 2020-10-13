module.exports = (sequelize, datatypes) => {
    return sequelize.define('events', {
        name: {
            type: datatypes.STRING,
            allowNull: false
        },
        description: {
            type: datatypes.STRING(2000),
            allowNull: false
        },
        roleId: {
            type: datatypes.STRING
        },
        expired: {
            type: datatypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        date: {
            type: datatypes.DATE,
            allowNull: false
        },
        createdBy: {
            type: datatypes.STRING,
            allowNull: false
        }
    });
}
