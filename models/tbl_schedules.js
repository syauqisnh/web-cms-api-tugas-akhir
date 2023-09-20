"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_schedules extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_schedules.init(
    {
      schedule_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      schedule_uuid: DataTypes.STRING,
      schedule_title: DataTypes.STRING,
      schedule_status: {
        type: DataTypes.ENUM('Y', 'N'),
        defaultValue: 'N'
      },
      schedule_start: DataTypes.DATE,
      schedule_finish: DataTypes.DATE,
      schedule_address: DataTypes.STRING,
      schedule_business: DataTypes.STRING,
      schedule_create_at: DataTypes.DATE,
      schedule_update_at: DataTypes.DATE,
      schedule_delete_at: DataTypes.DATE,
      schedule_create_by: DataTypes.STRING,
      schedule_update_by: DataTypes.STRING,
      schedule_delete_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_schedules",
      timestamps: false,
    }
  );
  return tbl_schedules;
};
