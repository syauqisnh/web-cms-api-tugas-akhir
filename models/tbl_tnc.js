"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_tnc extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_tnc.init(
    {
      tnc_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      tnc_uuid: DataTypes.STRING,
      tnc_uuid_table: DataTypes.STRING,
      tnc_name: DataTypes.STRING,
      tnc_business: DataTypes.STRING,
      tnc_create_at: DataTypes.DATE,
      tnc_update_at: DataTypes.DATE,
      tnc_delete_at: DataTypes.DATE,
      tnc_create_by: DataTypes.STRING,
      tnc_update_by: DataTypes.STRING,
      tnc_delete_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_tnc",
      timestamps: false,
    }
  );
  return tbl_tnc;
};
