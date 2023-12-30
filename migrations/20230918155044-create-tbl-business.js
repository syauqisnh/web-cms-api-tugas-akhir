'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_business', {
      business_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(50)
      },
      business_uuid: {
        type: Sequelize.STRING
      },
      business_name: {
        type: Sequelize.STRING
      },
      business_desc: {
        type: Sequelize.STRING
      },
      business_province: {
        type: Sequelize.STRING
      },
      business_regency: {
        type: Sequelize.STRING
      },
      business_subdistrict: {
        type: Sequelize.STRING
      },
      business_address: {
        type: Sequelize.STRING
      },
      business_notelp: {
        type: Sequelize.STRING
      },
      business_email: {
        type: Sequelize.STRING
      },
      business_link_wa: {
        type: Sequelize.STRING
      },
      business_customer: {
        type: Sequelize.STRING
      },
      business_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      business_update_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      business_delete_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      business_create_by: {
        type: Sequelize.STRING
      },
      business_update_by: {
        type: Sequelize.STRING
      },
      business_delete_by: {
        type: Sequelize.STRING
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_business');
  }
};