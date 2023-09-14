'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tbl_testimonials', {
      testimonial_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER(50)
      },
      testimonial_uuid: {
        type: Sequelize.STRING
      },
      testimonial_message: {
        type: Sequelize.STRING
      },
      testimonial_name: {
        type: Sequelize.STRING
      },
      testimonial_rating: {
        type: Sequelize.INTEGER
      },
      testimonial_status: {
        type: Sequelize.ENUM('true', 'false'),
        defaultValue: 'false',
      },
      testimonial_business: {
        type: Sequelize.STRING
      },
      testimonial_create_at: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      testimonial_update_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      testimonial_delete_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      testimonial_create_by: {
        type: Sequelize.STRING
      },
      testimonial_update_by: {
        type: Sequelize.STRING
      },
      testimonial_delete_by: {
        type: Sequelize.STRING
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tbl_testimonials');
  }
};