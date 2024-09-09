"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_business extends Model {
    static associate(models) {
      tbl_business.hasOne(models.tbl_media, {
        foreignKey: 'media_uuid_table',
        sourceKey: 'business_uuid',
      });

      tbl_business.belongsTo(models.tbl_customer, {
        foreignKey: "business_customer",
        targetKey: "customer_uuid",
        as: "business_customer_as",
      });

      tbl_business.belongsTo(models.tbl_user, {
        foreignKey: "business_customer",
        targetKey: "user_uuid",
        as: "business_user_as",
      });

      tbl_business.hasOne(models.tbl_media, {
        foreignKey: 'media_uuid_table',
        sourceKey: 'business_uuid',
        as: "business_media_as",
      });
    }
  }
  tbl_business.init(
    {
      business_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      business_uuid: DataTypes.STRING,
      business_name: DataTypes.STRING,
      business_desc: DataTypes.STRING,
      business_province: DataTypes.STRING,
      business_regency: DataTypes.STRING,
      business_subdistrict: DataTypes.STRING,
      business_address: DataTypes.STRING,
      business_notelp: DataTypes.STRING,
      business_email: DataTypes.STRING,
      business_link_wa: DataTypes.STRING,
      business_customer: DataTypes.STRING,
      business_media: DataTypes.STRING,
      business_create_at: DataTypes.DATE,
      business_update_at: DataTypes.DATE,
      business_delete_at: DataTypes.DATE,
      business_create_by: DataTypes.STRING,
      business_update_by: DataTypes.STRING,
      business_delete_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_business",
      tableName: "tbl_business",
      timestamps: false,
    }
  );
  return tbl_business;
};