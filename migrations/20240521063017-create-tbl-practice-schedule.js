'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_practice_schedule', {
      practice_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      practice_uuid: {
        type: Sequelize.STRING,
        allowNull: false
      },
      doctor_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      doctor_position: {
        type: Sequelize.STRING,
        allowNull: false
      },
      practice_business: {
        type: Sequelize.STRING,
        allowNull: false
      },
      practice_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      practice_start: {
        type: Sequelize.TIME,
        allowNull: false
      },
      practice_end: {
        type: Sequelize.TIME,  
        allowNull: false
      },
      practice_create_at: {
        allowNull: false,
        type: Sequelize.BIGINT,
        defaultValue: Math.floor(Date.now() / 1000),
      },
      practice_update_at: {
        allowNull: true,
        type: Sequelize.BIGINT,
      },
      practice_delete_at: {
        allowNull: true,
        type: Sequelize.BIGINT,
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_practice_schedule');
  }
};
