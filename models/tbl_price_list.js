"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_price_list extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tbl_price_list.belongsTo(models.tbl_business, {
        foreignKey: 'price_list_business',
        targetKey: 'business_uuid', 
        as: "price_business_as",
      });

      tbl_price_list.hasOne(models.tbl_media, {
        foreignKey: 'media_uuid_table',
        sourceKey: 'price_list_uuid',
        as: "price_media_as",
      });
    }
  }
  tbl_price_list.init(
    {
      price_list_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      price_list_uuid: DataTypes.STRING,
      price_list_name: DataTypes.STRING,
      price_list_price: DataTypes.STRING,
      price_list_desc: DataTypes.STRING,
      price_list_status: {
        type: DataTypes.ENUM('Y', 'N'),
        defaultValue: 'N'
      },
      price_list_order: DataTypes.STRING,
      price_list_business: DataTypes.STRING,
      price_list_media: DataTypes.STRING,
      price_list_create_at: DataTypes.DATE,
      price_list_update_at: DataTypes.DATE,
      price_list_delete_at: DataTypes.DATE,
      price_list_create_by: DataTypes.STRING,
      price_list_update_by: DataTypes.STRING,
      price_list_delete_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_price_list",
      tableName: "tbl_price_list",
      timestamps: false,
    }
  );
  return tbl_price_list;
};
