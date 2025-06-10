// server/src/migrations/20250610121000-add-role-and-account-status-to-users.js
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('users', 'role', {
            type: Sequelize.ENUM('user', 'admin'),
            allowNull: false,
            defaultValue: 'user',
        });
        await queryInterface.addColumn('users', 'accountStatus', {
            type: Sequelize.ENUM('active', 'banned'),
            allowNull: false,
            defaultValue: 'active',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', 'role');
        await queryInterface.removeColumn('users', 'accountStatus');
    }
};