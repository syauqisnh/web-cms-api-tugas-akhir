'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_service', {
      service_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      service_uuid: {
        type: Sequelize.STRING,
        allowNull: false
      },
      service_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      service_business: {
        type: Sequelize.STRING,
        allowNull: false
      },
      service_quota: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      service_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      service_update_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      service_delete_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_service');
  }
};
