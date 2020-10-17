'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('customers', {
            id: {
                type: Sequelize.STRING,
                primaryKey: true
            },
            createdAt: {
                type: Sequelize.DATE
            },
            updatedAt: {
                type: Sequelize.DATE
            },
            stripeCustomerId: {
                type: Sequelize.STRING
            },
            premium: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        });
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.dropTable('customers');
    }
};
