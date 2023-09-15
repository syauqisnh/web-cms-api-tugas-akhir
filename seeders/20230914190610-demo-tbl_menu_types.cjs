'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('tbl_menu_types', [
      {
        menu_type_uuid: 'f3334575-9962-4b9c-9ad0-c5631edfebad',
        menu_type_name: 'sidebar',
        menu_type_desc: '',
      },
      {
        menu_type_uuid: 'be6d7a54-2abf-480a-8085-2b13ec050bd5',
        menu_type_name: 'topbar',
        menu_type_desc: '',
      },
      {
        menu_type_uuid: 'b227dd9d-c5a4-47a7-ae98-74ed90e86574',
        menu_type_name: 'footer',
        menu_type_desc: '',
      },
      {
        menu_type_uuid: '4a5e3969-9a6e-4d4a-bd50-58124e6cad10',
        menu_type_name: 'section',
        menu_type_desc: '',
      },
      {
        menu_type_uuid: '23a2a3be-f80c-40ab-83b7-2676c881d38b',
        menu_type_name: 'module',
        menu_type_desc: '',
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('tbl_menu_types', null, {});
  },
};