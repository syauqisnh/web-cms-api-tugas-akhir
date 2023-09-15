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
    page_type_uuid: DataTypes.STRING,
    page_type_name: DataTypes.STRING,
    page_type_desc: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'tbl_page_types',
  });
  return tbl_page_types;
};
