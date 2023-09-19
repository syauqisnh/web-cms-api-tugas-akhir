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
      // define association here
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
      price_list_status: DataTypes.ENUM,
      price_list_order: DataTypes.STRING,
      price_list_business: DataTypes.STRING,
      price_list_media: DataTypes.STRING,
      paket_harga_create_at: DataTypes.DATE,
      paket_harga_update_at: DataTypes.DATE,
      paket_harga_delete_at: DataTypes.DATE,
      paket_harga_create_by: DataTypes.STRING,
      paket_harga_update_by: DataTypes.STRING,
      paket_harga_delete_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_price_list",
      timestamps: false,
    }
  );
  return tbl_price_list;
};
