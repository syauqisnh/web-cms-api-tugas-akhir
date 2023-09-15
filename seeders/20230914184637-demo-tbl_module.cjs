'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('tbl_module', [
      {
        module_uuid: '73f0d276-f1d3-4e60-8346-11b2939ba288',
        module_name: 'business',
        module_desc: '',
      },
      {
        module_uuid: '31add47c-e969-43a6-b841-924f8b29e487',
        module_name: 'galleries',
        module_desc: '',
      },
      {
        module_uuid: '16ec3d04-2453-41c0-983e-1df2b4c72920',
        module_name: 'price list',
        module_desc: '',
      },
      {
        module_uuid: '28e0ecff-492f-4b40-bcb7-a3cae6a26b31',
        module_name: 'tnc',
        module_desc: '',
      },
      {
        module_uuid: '1a6d98ef-59d7-4839-a77e-ee3febca0385',
        module_name: 'teams',
        module_desc: '',
      },
      {
        module_uuid: 'e3781f02-6d4e-449d-828f-1f38a1058c3a',
        module_name: 'scopes',
        module_desc: '',
      },
      {
        module_uuid: '5f0e93de-350d-443e-9053-1182cf8c70c1',
        module_name: 'testimonials',
        module_desc: '',
      },
      {
        module_uuid: '5756056f-c580-4ea4-bb6b-847bc134db2b',
        module_name: 'scedules',
        module_desc: '',
      },
      {
        module_uuid: '2c5088f6-92ac-476a-9818-20b0d1a6aac2',
        module_name: 'page',
        module_desc: '',
      },
      {
        module_uuid: 'a693710f-31eb-42bd-824b-94d8da500c7f',
        module_name: 'page types',
        module_desc: '',
      },
      {
        module_uuid: '8d3e4220-40cc-4a57-ab08-5004e9051682',
        module_name: 'menu levels',
        module_desc: '',
      },
      {
        module_uuid: '37db663a-f201-41cf-b6ef-1a460302f877',
        module_name: 'menu types',
        module_desc: '',
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('tbl_module', null, {});
  },
};