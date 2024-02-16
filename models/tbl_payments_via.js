'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_payments_via extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_payments_via.init({
    payment_via_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER(50),
    },
    payment_via_uuid: DataTypes.STRING,
    payment_via_name: DataTypes.STRING,
    payment_via_create_at: DataTypes.DATE,
    payment_via_update_at: DataTypes.DATE,
    payment_via_delete_at: DataTypes.DATE,
    payment_via_create_by: DataTypes.STRING,
    payment_via_update_by: DataTypes.STRING,
    payment_via_delete_by: DataTypes.STRING,
  }, {
    sequelize,
    timestamps: false,
    modelName: 'tbl_payments_via',
    tableName: "tbl_payments_via"
  });
  return tbl_payments_via;
};