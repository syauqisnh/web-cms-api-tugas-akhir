'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_menu_levels', {
      menu_level_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(50)
      },  
      menu_level_uuid: {
        type: Sequelize.STRING
      },
      menu_level_menu_type: {
        type: Sequelize.STRING
      },
      menu_level_name: {
        type: Sequelize.STRING
      },
      menu_level_link: {
        type: Sequelize.STRING
      },
      menu_level_slug: {
        type: Sequelize.STRING
      },
      menu_level_icon: {
        type: Sequelize.STRING
      },
      menu_level_sub: {
        type: Sequelize.STRING
      },
      menu_level_business: {
        type: Sequelize.STRING
      },
      menu_level_status: {
        type: Sequelize.ENUM('Y', 'N'),
        defaultValue: 'N',
      },
      menu_level_order: {
        type: Sequelize.STRING
      },
      menu_level_config: {
        type: Sequelize.STRING
      },
      menu_level_page: {
        type: Sequelize.STRING
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_menu_levels');
  }
};