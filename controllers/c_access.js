const db = require("../models");
const tbl_access = db.tbl_access;
const tbl_levels = db.tbl_levels;
const tbl_modules = db.tbl_modules;
const tbl_permissions = db.tbl_permissions;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");

const post_access = async (req, res) => {
  try {
    const { access_modul, access_permission, access_level } = req.body;

    if (!access_modul || !access_permission || !access_level) {
      return res.status(400).json({
        success: false,
        message: "Data harus di isi",
        data: null,
      });
    }

    const access_uuid = uuidv4();

    const new_access = await tbl_access.create({
      access_uuid: access_uuid,
      access_modul: access_modul,
      access_permission: access_permission,
      access_level: access_level,
    });

    if (!new_access) {
      return res.status(404).json({
        success: true,
        message: "Gagal menambahkan data",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil Menambahkan Data",
      data: {
        access_uuid: new_access.access_uuid,
        access_modul: new_access.access_modul,
        access_permission: new_access.access_permission,
        access_level: new_access.access_level,
      },
    });
  } catch (error) {
    console.error(error, "System Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Eror",
      data: null,
    });
  }
};

const put_access = async (req, res) => {
  try {
    const { access_uuid } = req.params;
    const { access_modul, access_permission, access_level } = req.body;

    if (!access_modul || !access_permission || !access_level) {
      return res.status(400).json({
        success: false,
        message: "Data harus di isi",
        data: null,
      });
    }

    const new_update = await tbl_access.findOne({
      where: { access_uuid },
    });

    new_update.access_modul = access_modul;
    await new_update.save();

    new_update.access_permission = access_permission;
    await new_update.save();

    new_update.access_level = access_level;
    await new_update.save();

    new_update.access_update_at = new Date();
    await new_update.save();

    if (!new_update) {
      return res.status(404).json({
        success: false,
        message: "Gagal mengedit data",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil mengedit data",
      data: {
        access_modul: new_update.access_modul,
        access_permission: new_update.access_permission,
        access_level: new_update.access_level,
        access_create_at: new_update.access_create_at,
        access_update_at: new_update.access_update_at,
      },
    });
  } catch (error) {
    console.error(error, "System Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const delete_access = async (req, res) => {
  try {
    const { access_uuid } = req.params;

    const new_delete = await tbl_access.findOne({
      where: { access_uuid },
    });

    if (!new_delete) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data",
        data: null,
      });
    }

    await new_delete.update({ access_delete_at: new Date() });

    res.status(200).json({
      success: true,
      message: "Sukses menghapus data",
    });
  } catch (error) {
    console.error(error, 'System Error')
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        data: null
    })
  }
};

const get_all_access = async (req, res) => {
    try {
      const { limit = null, page = null, keyword = '', order = { access_id: 'desc' }, filter = {} } = req.query;
  
      let offset = limit && page ? (page - 1) * limit : 0;
      const orderField = Object.keys(order)[0];
      const orderDirection = order[orderField]?.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  
      const whereClause = {
        access_delete_at: null,
      };
  
      if (filter.access_modul && filter.access_permission && filter.access_level) {
        whereClause.access_modul = Array.isArray(filter.access_modul) ? filter.access_modul : filter.access_modul.split(',');
        whereClause.access_permission = Array.isArray(filter.access_permission) ? filter.access_permission : filter.access_permission.split(',');
        whereClause.access_level = Array.isArray(filter.access_level) ? filter.access_level : filter.access_level.split(',');
      }
  
      const { count, rows } = await tbl_access.findAndCountAll({
        where: whereClause,
        order: [[orderField, orderDirection]],
        limit: limit ? parseInt(limit) : null,
        offset: offset,
        include: [
          {
            model: tbl_levels,
            as: 'access_level_association',
            attributes: ['level_uuid', 'level_name'],
          },
          {
            model: tbl_modules,
            as: "access_modul_association",
            attributes: ['modul_uuid', 'modul_name'],
          },
          {
            model: tbl_permissions,
            as: 'access_permission_association',
            attributes: ['permission_uuid', 'permission_name'],
          },
        ],
      });
  
      const totalPages = Math.ceil(count / limit);
      const hasNextPage = page < totalPages;
  
      res.status(200).json({
        success: true,
        message: 'Sukses mendapatkan data',
        data: rows.map((row) => ({
          access_uuid: row.access_uuid,
          access_level: {
            level_uuid: row.access_level.level_uuid,
            level_name: row.access_level.level_name,
          },
          access_modul: {
            modul_uuid: row.access_modul.modul_uuid,
            modul_name: row.access_modul.modul_name,
          },
          access_permission: {
            permission_uuid: row.access_permission.permission_uuid,
            permission_name: row.access_permission.permission_name,
          },
        })),
        pages: {
          total: totalPages,
          per_page: limit ? parseInt(limit) : count,
          next_page: hasNextPage ? parseInt(page) + 1 : null,
          to: offset + rows.length,
          last_page: totalPages,
          current_page: parseInt(page),
          from: offset,
        },
      });
    } catch (error) {
      console.error(error, 'System Error');
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        data: null,
      });
    }
  };
  

const get_detail_access = async (req, res) => {
    try {
        const { access_uuid } = req.params

        const detail_access = await tbl_access.findOne({
            where: {
                access_uuid,
                access_delete_at: null
            }
        })
    
        if (!detail_access) {
            return res.status(404).json({
                success: false,
                message: 'Gagal mendapatkan data',
                data: null
            })
        }
    
        const result = {
            success: true,
            message: 'Berhasil mendapatkan data',
            data: {
                access_uuid: detail_access.access_uuid,
                access_modul: detail_access.access_modul,
                access_permission: detail_access.access_permission,
                access_level: detail_access.access_level,
            }
        }
    
        res.status(200).json(result)
    } catch (error) {
        console.log(error, "System Error");
        res.status(500).json({
          success: false,
          message: "Internal server error",
          data: null,
        });
    }
}
module.exports = {
  post_access,
  put_access,
  delete_access,
  get_all_access,
  get_detail_access,
};
