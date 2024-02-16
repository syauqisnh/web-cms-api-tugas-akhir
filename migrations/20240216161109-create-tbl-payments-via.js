'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_payments_via', {
      payment_via_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(50)
      },
      payment_via_uuid: {
        type: Sequelize.STRING
      },
      payment_via_name: {
        type: Sequelize.STRING
      },
      payment_via_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      payment_via_update_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      payment_via_delete_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      payment_via_create_by: {
        type: Sequelize.STRING,
      },
      payment_via_update_by: {
        type: Sequelize.STRING,
      },
      payment_via_delete_by: {
        type: Sequelize.STRING
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_payments_via');
  }
};