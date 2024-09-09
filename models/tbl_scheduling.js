"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class tbl_scheduling extends Model {
    static associate(models) {
      tbl_scheduling.belongsTo(models.tbl_practice_schedule, {
        foreignKey: 'schedule_practice',
        targetKey: 'practice_uuid',
        as: "practice_schedule_as",
      });
      tbl_scheduling.belongsTo(models.tbl_business, {
        foreignKey: 'schedule_business',
        targetKey: 'business_uuid',
        as: "business_schedule_as",
      });
      tbl_scheduling.belongsTo(models.tbl_teams, {
        foreignKey: 'schedule_doctor',
        targetKey: 'team_uuid',
        as: "team_schedule_as",
      });  
    }
  }

  tbl_scheduling.init(
    {
      schedule_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      schedule_uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      schedule_queue: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      schedule_name_pasien: {
        type: DataTypes.STRING,
        allowNull: false
      },
      schedule_noHp_pasien: {
        type: DataTypes.STRING,
        allowNull: false
      },
      schedule_status: {
        type: DataTypes.ENUM('Y', 'N'),
        defaultValue: 'N'
      },
      schedule_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      schedule_start_practice: {
        type: DataTypes.TIME,
        allowNull: true
      },
      schedule_finish_practice: {
        type: DataTypes.TIME,
        allowNull: true
      },
      schedule_address: {
        type: DataTypes.STRING,
        allowNull: false
      },
      schedule_practice: {
        type: DataTypes.STRING,
        allowNull: false
      },
      schedule_business: {
        type: DataTypes.STRING,
        allowNull: false
      },
      schedule_doctor: {
        type: DataTypes.STRING,
        allowNull: false
      },
      schedule_create_at: {
        allowNull: false,
        type: DataTypes.BIGINT,
        defaultValue: Math.floor(Date.now() / 1000),
      },
      schedule_update_at: {
        allowNull: true,
        type: DataTypes.BIGINT
      },
      schedule_delete_at: {
        allowNull: true,
        type: DataTypes.BIGINT
      }
    },
    {
      sequelize,
      modelName: "tbl_scheduling",
      tableName: "tbl_scheduling",
      timestamps: false,
    }
  );

  return tbl_scheduling;
};
