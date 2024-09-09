"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_teams extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tbl_teams.hasOne(models.tbl_media, {
        foreignKey: 'media_uuid_table',
        sourceKey: 'team_uuid',
      });

      tbl_teams.belongsTo(models.tbl_business, {
        foreignKey: 'team_business',
        targetKey: 'business_uuid', 
        as: "team_business_as",
      });

      tbl_teams.belongsTo(models.tbl_scopes, {
        foreignKey: 'team_scope',
        targetKey: 'scope_uuid', 
        as: "team_scope_as",
      });

      tbl_teams.hasOne(models.tbl_media, {
        foreignKey: 'media_uuid_table',
        sourceKey: 'team_uuid',
        as: "team_media_as",
      });
    }
  }
  tbl_teams.init(
    {
      team_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      team_uuid: DataTypes.STRING,
      team_name: DataTypes.STRING,
      team_job_desc: DataTypes.STRING,
      team_scope: DataTypes.STRING,
      team_business: DataTypes.STRING,
      team_media: DataTypes.STRING,
      team_create_at: DataTypes.DATE,
      team_update_at: DataTypes.DATE,
      team_delete_at: DataTypes.DATE,
      team_create_by: DataTypes.STRING,
      team_update_by: DataTypes.STRING,
      team_delete_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_teams",
      tableName: "tbl_teams",
      timestamps: false,
    }
  );
  return tbl_teams;
};