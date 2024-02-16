'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_payments', {
      payment_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(50)
      },
      payment_uuid: {
        type: Sequelize.STRING
      },
      payment_customer: {
        type: Sequelize.STRING
      },
      payment_date: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      payment_via: {
        type: Sequelize.STRING
      },
      payment_from_bank: {
        type: Sequelize.STRING
      },
      payment_from_name: {
        type: Sequelize.STRING
      },
      payment_to: {
        type: Sequelize.STRING
      },
      payment_pricing_selected: {
        type: Sequelize.STRING
      },
      payment_status: {
        type: Sequelize.ENUM("Y", "N"),
        defaultValue: "N",
      },
      payment_amount: {
        type: Sequelize.DECIMAL(10, 2)
      },
      payment_proof: {
        type: Sequelize.STRING
      },
      payment_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      payment_update_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      payment_delete_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      payment_create_by: {
        type: Sequelize.STRING
      },
      payment_update_by: {
        type: Sequelize.STRING
      },
      payment_delete_by: {
        type: Sequelize.STRING
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_payments');
  }
};