"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("tbl_menu_types", [
      {
        menu_type_uuid: "44068685-1d98-4e9d-99f9-7e2d67a4ba19",
        menu_type_name: "sidebar",
        menu_type_desc: null
      },
      {
        menu_type_uuid: "21e6c670-4d13-4c80-be9e-a996d3e675db",
        menu_type_name: "topbar",
        menu_type_desc: null
      },
      {
        menu_type_uuid: "1f97e967-0648-42da-9182-2af8bc68fe31",
        menu_type_name: "footer",
        menu_type_desc: null
      },
      {
        menu_type_uuid: "ba63fe7f-572b-456c-9e3c-04e049abb241",
        menu_type_name: "section",
        menu_type_desc: null
      },
      {
        menu_type_uuid: "507e3572-0b4b-4f2b-b386-89a50b791254",
        menu_type_name: "module",
        menu_type_desc: null
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("tbl_menu_types", null, {});
  },
};