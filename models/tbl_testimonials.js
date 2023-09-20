"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class tbl_testimonials extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  tbl_testimonials.init(
    {
      testimonial_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(50),
      },
      testimonial_uuid: DataTypes.STRING,
      testimonial_message: DataTypes.STRING,
      testimonial_name: DataTypes.STRING,
      testimonial_rating: DataTypes.INTEGER,
      testimonial_status: {
        type: DataTypes.ENUM('true', 'false'),
        defaultValue: 'false',
      },
      testimonial_business: DataTypes.STRING,
      testimonial_create_at: DataTypes.DATE,
      testimonial_update_at: DataTypes.DATE,
      testimonial_delete_at: DataTypes.DATE,
      testimonial_create_by: DataTypes.STRING,
      testimonial_update_by: DataTypes.STRING,
      testimonial_delete_by: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "tbl_testimonials",
      timestamps: false,
    }
  );
  return tbl_testimonials;
};
