"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("tbl_page_types", [
      {
        page_type_uuid: '9dba10ff-1c0d-41cb-9d56-3977db7f240b',
        page_type_name: 'sidebar',
        page_type_desc: null,
      },
      {
        page_type_uuid: '0f1f3a6d-8975-4661-b81c-a9710ec3cfd4',
        page_type_name: 'topbar',
        page_type_desc: null,
      },
      {
        page_type_uuid: '925b1ded-32e2-4eb2-9387-7776056ca706',
        page_type_name: 'footer',
        page_type_desc: null,
      },
      {
        page_type_uuid: '4a702ae5-704c-431f-89a8-c61f2eb44a47',
        page_type_name: 'modul',
        page_type_desc: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("tbl_page_types", null, {});
  },
};