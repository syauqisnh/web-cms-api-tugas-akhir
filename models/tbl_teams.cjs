'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_teams extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_teams.init({
    team_uuid: DataTypes.STRING,
    team_name: DataTypes.STRING,
    team_work_tasks: DataTypes.STRING,
    team_scope: DataTypes.STRING,
    team_business: DataTypes.STRING,
    team_create_at: DataTypes.DATE,
    team_update_at: DataTypes.DATE,
    team_delete_at: DataTypes.DATE,
    team_create_by: DataTypes.STRING,
    team_update_by: DataTypes.STRING,
    team_delete_by : DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'tbl_teams',
  });
  return tbl_teams;
};