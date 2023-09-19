'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_tnc', {
      tnc_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(50)
      },
      tnc_uuid: {
        type: Sequelize.STRING
      },
      tnc_uuid_table: {
        type: Sequelize.STRING
      },
      tnc_name: {
        type: Sequelize.STRING
      },
      tnc_business: {
        type: Sequelize.STRING
      },
      tnc_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      tnc_update_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      tnc_delete_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      tnc_create_by: {
        type: Sequelize.STRING
      },
      tnc_update_by: {
        type: Sequelize.STRING
      },
      tnc_delete_by: {
        type: Sequelize.STRING
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_tnc');
  }
};