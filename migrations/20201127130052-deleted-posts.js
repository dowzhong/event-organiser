'use strict';

module.exports = {
    up: (queryInterface, DataTypes) => {
        return queryInterface.addColumn('events', 'postDeleted', {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('events', 'postDeleted');
    }
};
