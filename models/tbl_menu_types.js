"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_menu_types extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_menu_types.init(
    {
      menu_type_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      menu_type_uuid: DataTypes.STRING,
      menu_type_name: DataTypes.STRING,
      menu_type_desc: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_menu_types",
      timestamps: false,
    }
  );
  return tbl_menu_types;
};