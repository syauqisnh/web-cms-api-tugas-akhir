"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_pages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_pages.init(
    {
      page_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50)
      },
      page_uuid: DataTypes.STRING,
      page_title: DataTypes.STRING,
      page_slug: DataTypes.STRING,
      page_content: DataTypes.TEXT,
      page_heru: DataTypes.STRING,
      page_status: {
        type: DataTypes.ENUM('Y', 'N'),
        defaultValue: 'N'
      },
      page_page_type: DataTypes.STRING,
      page_business: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_pages",
      timestamps: false,
    }
  );
  return tbl_pages;
};
