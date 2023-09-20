"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_menu_levels extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_menu_levels.init(
    {
      menu_level_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      menu_level_uuid: DataTypes.STRING,
      menu_level_menu_type: DataTypes.STRING,
      menu_level_name: DataTypes.STRING,
      menu_level_link: DataTypes.STRING,
      menu_level_slug: DataTypes.STRING,
      menu_level_icon: DataTypes.STRING,
      menu_level_sub: DataTypes.STRING,
      menu_level_business: DataTypes.STRING,
      menu_level_status: {
        type: DataTypes.ENUM('Y', 'N'),
        defaultValue: 'N'
      },
      menu_level_order: DataTypes.STRING,
      menu_level_config: DataTypes.STRING,
      menu_level_page: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_menu_levels",
      timestamps: false,
    }
  );
  return tbl_menu_levels;
};
