"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_galleries extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tbl_galleries.hasMany(models.tbl_media, {
        foreignKey: 'media_uuid_table',
        sourceKey: 'gallery_uuid',
        as: "gallery_media_as",
      });

      tbl_galleries.belongsTo(models.tbl_business, {
        foreignKey: 'gallery_business',
        targetKey: 'business_uuid', 
        as: "gallery_business_as",
      });
    }
  }
  tbl_galleries.init(
    {
      gallery_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      gallery_uuid: DataTypes.STRING,
      gallery_name: DataTypes.STRING,
      gallery_desc: DataTypes.STRING,
      gallery_business: DataTypes.STRING,
      gallery_media: DataTypes.STRING,
      gallery_create_at: DataTypes.DATE,
      gallery_update_at: DataTypes.DATE,
      gallery_delete_at: DataTypes.DATE,
      gallery_create_by: DataTypes.STRING,
      gallery_update_by: DataTypes.STRING,
      gallery_delete_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_galleries",
      tableName: "tbl_galleries",
      timestamps: false,
    }
  );
  return tbl_galleries;
};
