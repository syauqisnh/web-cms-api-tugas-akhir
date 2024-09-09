'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('tbl_levels', [
      {
        level_uuid: 'c2119049-d099-456a-8597-6b06eec9d9b3',
        level_name: 'super administrator',
        level_create_at: new Date(),
        level_update_at: null,
        level_delete_at: null,
        level_create_by: null,
        level_update_by: null,
        level_delete_by: null,
      },
      {
        level_uuid: '9a852219-4356-4cec-a852-d03d20274e9e',
        level_name: 'administrator',
        level_create_at: new Date(),
        level_update_at: null,
        level_delete_at: null,
        level_create_by: null,
        level_update_by: null,
        level_delete_by: null,
      },
      {
        level_uuid: '7b061c93-3a7a-4cc9-acd3-8fd302b63379',
        level_name: 'customer',
        level_create_at: new Date(),
        level_update_at: null,
        level_delete_at: null,
        level_create_by: null,
        level_update_by: null,
        level_delete_by: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('tbl_levels', null, {});
  },
};