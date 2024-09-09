"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert("tbl_modules", [
      {
        module_uuid: "4a8e8612-2daf-4ccd-831b-b3d29945dbf8",
        module_name: "business",
        module_desc: null,
      },
      {
        module_uuid: "17c5e83b-0aba-4f11-987e-f49c2f19c975",
        module_name: "galleries",
        module_desc: null,
      },
      {
        module_uuid: "7e481b7b-07b8-42a5-bd81-3d93697eafda",
        module_name: "price list",
        module_desc: null,
      },
      {
        module_uuid: "65f8fed5-2a34-476a-9f60-71107dd4cdaa",
        module_name: "tnc",
        module_desc: null,
      },
      {
        module_uuid: "91281232-e8f7-4fd2-b506-1ff8f8eb2473",
        module_name: "teams",
        module_desc: null,
      },
      {
        module_uuid: "404c00b5-1c1b-48c5-941b-2b5b973eaccd",
        module_name: "scopes",
        module_desc: null,
      },
      {
        module_uuid: "f5ee130f-0407-436f-9af4-12a11a647931",
        module_name: "testimonials",
        module_desc: null,
      },
      {
        module_uuid: "2f7aea18-9f19-40dd-85a7-043646260151",
        module_name: "scedules",
        module_desc: null,
      },
      {
        module_uuid: "15710f99-7adc-4dc2-9f40-d5c1cc02c9c9",
        module_name: "page",
        module_desc: null,
      },
      {
        module_uuid: "c25e6656-0363-4611-964b-c4e476d51209",
        module_name: "page types",
        module_desc: null,
      },
      {
        module_uuid: "688611f1-a942-4fba-98e2-dde92bc02b48",
        module_name: "menu levels",
        module_desc: null,
      },
      {
        module_uuid: "dac18bf5-a239-4f91-8927-67cafd26060c",
        module_name: "menu types",
        module_desc: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("tbl_modules", null, {});
  },
};