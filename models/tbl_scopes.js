"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_scopes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      tbl_scopes.belongsTo(models.tbl_business, {
        foreignKey: 'scope_business',
        targetKey: 'business_uuid', 
        as: "scope_business_as",
      });

    }
  }
  tbl_scopes.init(
    {
      scope_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      scope_uuid: DataTypes.STRING,
      scope_name: DataTypes.STRING,
      scope_desc: DataTypes.STRING,
      scope_business: DataTypes.STRING,
      scope_create_at: DataTypes.DATE,
      scope_update_at: DataTypes.DATE,
      scope_delete_at: DataTypes.DATE,
      scope_create_by: DataTypes.STRING,
      scope_update_by: DataTypes.STRING,
      scope_delete_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_scopes",
      tableName: "tbl_scopes",
      timestamps: false,
    }
  );
  return tbl_scopes;
};
