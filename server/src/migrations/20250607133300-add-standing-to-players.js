'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('players', 'standing', {
            type: Sequelize.INTEGER,
            allowNull: true,
            defaultValue: null,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('players', 'standing');
    }
};