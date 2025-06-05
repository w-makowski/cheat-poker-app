'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('players', 'auth0Id', {
            type: Sequelize.STRING,
            allowNull: false,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('players', 'auth0Id');
    }
};