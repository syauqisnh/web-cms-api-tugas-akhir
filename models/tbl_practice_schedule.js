'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class tbl_practice_schedule extends Model {
    static associate(models) {
      tbl_practice_schedule.belongsTo(models.tbl_business, {
        foreignKey: 'practice_business',
        targetKey: 'business_uuid',
        as: "practice_business_as",
      });
      tbl_practice_schedule.belongsTo(models.tbl_teams, {
        foreignKey: 'doctor_name',
        targetKey: 'team_uuid',
        as: "teams_practice_as",
      });
      tbl_practice_schedule.belongsTo(models.tbl_service, {
        foreignKey: 'doctor_position',
        targetKey: 'service_uuid',
        as: "service_practice_as",
      });
    }
  }

  tbl_practice_schedule.init({
    practice_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    practice_uuid: {
      type: DataTypes.STRING,
      allowNull: false
    },
    doctor_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    doctor_position: {
      type: DataTypes.STRING,
      allowNull: false
    },
    practice_business: {
      type: DataTypes.STRING,
      allowNull: false
    },
    practice_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    practice_start: {
      type: DataTypes.TIME,
      allowNull: false
    },
    practice_end: {
      type: DataTypes.TIME,
      allowNull: false
    },
    practice_create_at: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: Math.floor(Date.now() / 1000)
    },
    practice_update_at: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    practice_delete_at: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'tbl_practice_schedule',
    tableName: 'tbl_practice_schedule',
    timestamps: false,
  });

  return tbl_practice_schedule;
};
