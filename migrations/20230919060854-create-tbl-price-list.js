'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_price_list', {
      price_list_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(50)
      },
      price_list_uuid: {
        type: Sequelize.STRING
      },
      price_list_name: {
        type: Sequelize.STRING
      },
      price_list_price: {
        type: Sequelize.STRING
      },
      price_list_desc: {
        type: Sequelize.STRING
      },
      price_list_status: {
        type: Sequelize.ENUM('Y', 'N'),
        defaultValue: 'N'
      },
      price_list_order: {
        type: Sequelize.STRING
      },
      price_list_business: {
        type: Sequelize.STRING
      },
      price_list_media: {
        type: Sequelize.STRING
      },
      paket_harga_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      paket_harga_update_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      paket_harga_delete_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      paket_harga_create_by: {
        type: Sequelize.STRING
      },
      paket_harga_update_by: {
        type: Sequelize.STRING
      },
      paket_harga_delete_by: {
        type: Sequelize.STRING
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_price_list');
  }
};