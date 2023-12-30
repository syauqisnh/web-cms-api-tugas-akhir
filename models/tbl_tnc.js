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
      tbl_tnc.belongsTo(models.tbl_price_list, {
        foreignKey: 'tnc_uuid_table',
        targetKey: 'price_list_uuid', 
        as: "tnc_price_as",
      });

      tbl_tnc.belongsTo(models.tbl_business, {
        foreignKey: 'tnc_business',
        targetKey: 'business_uuid',
        as: 'tnc_business_as'
      });
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
      tableName: "tbl_tnc",
      timestamps: false,
    }
  );
  return tbl_tnc;
};
