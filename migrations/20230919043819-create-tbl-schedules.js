'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_schedules', {
      schedule_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(50),
      },
      schedule_uuid: {
        type: Sequelize.STRING
      },
      schedule_title: {
        type: Sequelize.STRING
      },
      schedule_status: {
        type: Sequelize.ENUM('Y', 'N'),
        defaultValue: 'N'
      },
      schedule_start: {
        allowNull: true,
        type: Sequelize.DATE
      },
      schedule_finish: {
        allowNull: true,
        type: Sequelize.DATE
      },
      schedule_address: {
        type: Sequelize.STRING
      },
      schedule_business: {
        type: Sequelize.STRING
      },
      schedule_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      schedule_update_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      schedule_delete_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      schedule_create_by: {
        type: Sequelize.STRING
      },
      schedule_update_by: {
        type: Sequelize.STRING
      },
      schedule_delete_by: {
        type: Sequelize.STRING
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_schedules');
  }
};