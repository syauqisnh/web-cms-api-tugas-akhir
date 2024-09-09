"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class tbl_service extends Model {
    static associate(models) {
      tbl_service.belongsTo(models.tbl_business, {
        foreignKey: 'service_business',
        targetKey: 'business_uuid', 
        as: "service_business_as",
      });
    }
  }

  tbl_service.init(
    {
      service_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      service_uuid: DataTypes.STRING,
      service_name: DataTypes.STRING,
      service_business: DataTypes.STRING,
      service_quota: DataTypes.INTEGER,
      service_create_at: DataTypes.DATE,
      service_update_at: DataTypes.DATE,
      service_delete_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "tbl_service",
      tableName: "tbl_service",
      timestamps: false,
    }
  );

  return tbl_service;
};
