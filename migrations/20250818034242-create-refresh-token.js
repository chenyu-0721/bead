'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RefreshTokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      tokenHash: {
        type: Sequelize.STRING
      },
      familyId: {
        type: Sequelize.STRING
      },
      userAgent: {
        type: Sequelize.STRING
      },
      ip: {
        type: Sequelize.STRING
      },
      expiresAt: {
        type: Sequelize.DATE
      },
      revokedAt: {
        type: Sequelize.DATE
      },
      replacedByToken: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RefreshTokens');
  }
};