'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_page_types', {
      page_type_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(50)
      },
      page_type_uuid: {
        type: Sequelize.STRING
      },
      page_type_name: {
        type: Sequelize.STRING
      },
      page_type_desc: {
        type: Sequelize.STRING
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_page_types');
  }
};