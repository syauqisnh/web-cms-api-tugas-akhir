'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('tbl_page_types', [
      {
        page_type_uuid: 'f11fb817-3ee5-43e3-8502-352aacf97926',
        page_type_name: 'sidebar',
        page_type_desc: '',
      },
      {
        page_type_uuid: '05137075-5e9f-4289-836e-9c19691de4f9',
        page_type_name: 'topbar',
        page_type_desc: '',
      },
      {
        page_type_uuid: '30af6418-5f3c-44fc-bbd2-0a144e24cfa8',
        page_type_name: 'footer',
        page_type_desc: '',
      },
      {
        page_type_uuid: '7779a668-42f2-428f-89af-0421df028515',
        page_type_name: 'modul',
        page_type_desc: '',
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('tbl_page_types', null, {});
  },
};