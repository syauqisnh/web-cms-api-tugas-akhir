'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_galleries', {
      gallery_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(50)
      },
      gallery_uuid: {
        type: Sequelize.STRING
      },
      gallery_name: {
        type: Sequelize.STRING
      },
      gallery_desc: {
        type: Sequelize.STRING
      },
      gallery_business: {
        type: Sequelize.STRING
      },
      gallery_media: {
        type: Sequelize.STRING
      },
      gallery_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      gallery_update_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      gallery_delete_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      gallery_create_by: {
        type: Sequelize.STRING
      },
      gallery_update_by: {
        type: Sequelize.STRING
      },
      gallery_delete_by: {
        type: Sequelize.STRING
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_galleries');
  }
};