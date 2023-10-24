"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_access extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_access.init(
    {
      access_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      access_uuid: DataTypes.STRING,
      access_modul: DataTypes.STRING,
      access_permission: DataTypes.STRING,
      access_level: DataTypes.STRING,
      access_create_at: DataTypes.DATE,
      access_update_at: DataTypes.DATE,
      access_delete_at: DataTypes.DATE,
      access_create_by: DataTypes.STRING,
      access_update_by: DataTypes.STRING,
      access_delete_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_access",
      tableName: "tbl_access",
      timestamps: false,
      paranoid: true,
    }
  );
  return tbl_access;
};
