'use strict';

module.exports = {
    up: (queryInterface, DataTypes) => {
        return queryInterface.addColumn('events', 'createdBy', {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '177019589010522112'
        }).then(() => {
            return queryInterface.changeColumn('events', 'createdBy', {
                type: DataTypes.STRING,
                allowNull: false
            });
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('events', 'createdBy');
    }
};
