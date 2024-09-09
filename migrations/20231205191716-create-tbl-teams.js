"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tbl_teams", {
      team_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(50),
      },
      team_uuid: {
        type: Sequelize.STRING,
      },
      team_name: {
        type: Sequelize.STRING,
      },
      team_job_desc: {
        type: Sequelize.STRING,
      },
      team_scope: {
        type: Sequelize.STRING,
      },
      team_business: {
        type: Sequelize.STRING,
      },
      team_media: {
        type: Sequelize.STRING,
      },
      team_create_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      },
      team_update_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      team_delete_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      team_create_by: {
        type: Sequelize.STRING,
      },
      team_update_by: {
        type: Sequelize.STRING,
      },
      team_delete_by: {
        type: Sequelize.STRING,
      },
    }, {
      timestamps: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tbl_teams");
  },
};
