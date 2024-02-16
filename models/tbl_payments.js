'use strict';
const {
  Model
} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_payments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_payments.init(
  {
    payment_id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER(50),
    },
    payment_uuid: DataTypes.STRING,
    payment_customer: DataTypes.STRING,
    payment_date: DataTypes.DATE,
    payment_via: DataTypes.STRING,
    payment_from_bank: DataTypes.STRING,
    payment_from_name: DataTypes.STRING,
    payment_to: DataTypes.STRING,
    payment_pricing_selected: DataTypes.STRING,
    payment_status: {
      type: DataTypes.ENUM("Y", "N"),
      defaultValue: "N",
    },
    payment_amount: DataTypes.DECIMAL(10, 2),
    payment_proof: DataTypes.STRING,
    payment_create_at: DataTypes.DATE,
    payment_update_at: DataTypes.DATE,
    payment_delete_at: DataTypes.DATE,
    payment_create_by: DataTypes.STRING,
    payment_update_by: DataTypes.STRING,
    payment_delete_by: DataTypes.STRING,
  }, 
  {
    sequelize,
    modelName: "tbl_payments",
    tableName: "tbl_payments",
    timestamps: false,
  });
  return tbl_payments;
};