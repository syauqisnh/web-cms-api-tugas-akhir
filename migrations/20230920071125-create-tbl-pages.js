'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_pages', {
      page_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(50)
      },
      page_uuid: {
        type: Sequelize.STRING
      },
      page_title: {
        type: Sequelize.STRING
      },
      page_slug: {
        type: Sequelize.STRING
      },
      page_content: {
        type: Sequelize.TEXT
      },
      page_heru: {
        type: Sequelize.STRING
      },
      page_status: {
        type: Sequelize.ENUM('Y', 'N'),
        defaultValue: 'N'
      },
      page_page_type: {
        type: Sequelize.STRING
      },
      page_business: {
        type: Sequelize.STRING
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_pages');
  }
};