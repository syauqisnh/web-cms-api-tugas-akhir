'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class tbl_module extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_module.init({
    menu_type_uuid: DataTypes.STRING,
    menu_type_name: DataTypes.STRING,
    menu_type_desc: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tbl_menu_types',
  });
  return tbl_menu_types;
};
