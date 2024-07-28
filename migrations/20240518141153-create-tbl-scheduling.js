'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_scheduling', {
      schedule_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      schedule_uuid: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      schedule_queue: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      schedule_name_pasien: {
        type: Sequelize.STRING,
        allowNull: false
      },
      schedule_noHp_pasien: {
        type: Sequelize.STRING,
        allowNull: false
      },
      schedule_business: {
        type: Sequelize.STRING,
        allowNull: false
      },
      schedule_doctor: {
        type: Sequelize.STRING,
        allowNull: false
      },
      schedule_status: {
        type: Sequelize.ENUM('Y', 'N'),
        defaultValue: 'N'
      },
      schedule_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      schedule_start_practice: {
        type: Sequelize.TIME,
        allowNull: true
      },
      schedule_finish_practice: {
        type: Sequelize.TIME,
        allowNull: true
      },
      schedule_address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      schedule_practice: {
        type: Sequelize.STRING,
        allowNull: false
      },
      schedule_create_at: {
        allowNull: false,
        type: Sequelize.BIGINT,
        defaultValue: Math.floor(Date.now() / 1000),
      },
      schedule_update_at: {
        allowNull: true,
        type: Sequelize.BIGINT
      },
      schedule_delete_at: {
        allowNull: true,
        type: Sequelize.BIGINT
      }
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_scheduling');
  }
};
