'use strict';
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('Bekantan@bjm', saltRounds);
    const level = await queryInterface.sequelize.query(
      `SELECT level_uuid FROM tbl_levels WHERE level_name = 'super administrator';`, 
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    
    if (!level.length) {
      throw new Error('Level super administrator tidak ditemukan');
    }

    const superAdminUuid = level[0].level_uuid; // Perbaikan di sini

    return queryInterface.bulkInsert('tbl_user', [
      {
        user_uuid: 'c2119049-d099-456a-8597-6b06eec9d9b3',
        user_username: 'bekantan_administrator',
        user_full_name: 'bekantan administrator',
        user_nohp: '',
        user_email: 'superadmin@gmail.com',
        user_address: '',
        user_password: hashedPassword,
        user_level: superAdminUuid, // Gunakan UUID dari tbl_levels
        user_create_at: new Date(),
        user_update_at: null,
        user_delete_at: null,
        user_create_by: null,
        user_update_by: null,
        user_delete_by: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('tbl_user', null, {});
  },
};
