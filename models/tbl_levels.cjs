'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_levels extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_levels.init({
    level_uuid: DataTypes.STRING,
    level_name: DataTypes.STRING,
    level_create_at: DataTypes.DATE,
    level_update_at: DataTypes.DATE,
    level_delete_at: DataTypes.DATE,
    level_create_by: DataTypes.STRING,
    level_update_by: DataTypes.STRING,
    level_delete_by: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tbl_levels',
  });
  return tbl_levels;
};
