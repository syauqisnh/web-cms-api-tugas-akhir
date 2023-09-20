'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_scopes', {
      scope_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(50),
      },
      scope_uuid: {
        type: Sequelize.STRING
      },
      scope_name: {
        type: Sequelize.STRING
      },
      scope_desc: {
        type: Sequelize.STRING
      },
      scope_business: {
        type: Sequelize.STRING
      },
      scope_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      scope_update_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      scope_delete_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      scope_create_by: {
        type: Sequelize.STRING
      },
      scope_update_by: {
        type: Sequelize.STRING
      },
      scope_delete_by: {
        type: Sequelize.STRING
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_scopes');
  }
};