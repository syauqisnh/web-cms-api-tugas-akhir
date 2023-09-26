const db = require("../models");
const tbl_levels = db.tbl_levels;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");

// Untuk CREATE Datanya
const post_levels = async (req, res) => {
  try {
    const { level_name } = req.body;

    if (!level_name) {
      return res.status(400).json({
        success: false,
        message: "Belum ada data yang di isi",
        data: null,
      });
    }
    const level_uuid = uuidv4();

    const new_levels = await tbl_levels.create({
      level_uuid: level_uuid,
      level_name: level_name,
    });

    if (!new_levels) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Sukses menambah data",
      data: {
        level_uuid: new_levels.level_uuid,
        level_name: new_levels.level_name,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// Untuk Edit Datanya
const put_levels = async (req, res) => {
  try {
    const { level_uuid } = req.params;
    const { level_name } = req.body;

    const update_levels = await tbl_levels.findOne({
      where: { level_uuid },
    });

    if (!update_levels) {
      return res.status(404).json({
        success: false,
        message: "Gagal merubah data",
        data: null,
      });
    }

    update_levels.level_name = level_name;

    await update_levels.save();

    update_levels.level_update_at = new Date();
    await update_levels.save();

    res.json({
      success: true,
      message: "Sukses merubah data",
      data: {
        level_name: update_levels.level_name,
        level_create_at: update_levels.level_create_at,
        level_update_at: update_levels.level_update_at,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
    res.status(402).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// Untuk Delete Datanya
const delete_levels = async (req, res) => {
  try {
    const { level_uuid } = req.params;

    // Mencari entitas level berdasarkan level_uuid
    const delete_levels = await tbl_levels.findOne({
      where: { level_uuid },
    });

    if (!delete_levels) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data",
        data: null,
      });
    }

    await delete_levels.update({ level_delete_at: new Date() });

    res.json({
      success: true,
      message: "Sukses menghapus data",
    });
  } catch (error) {
    console.log(error, "Data Error");
    res.status(402).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// Untuk Menampilkan datanya berdasarkan UUID
const get_detail_level = async (req, res) => {
  try {
    const { level_uuid } = req.params;

    const detail_level = await tbl_levels.findOne({
      where: { level_uuid },
    });

    if (!detail_level) {
      return res.status(404).json({
        success: false,
        message: "Gagal mendapatkan data",
        data: null,
      });
    }

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: {
        level_uuid: detail_level.level_uuid,
        level_name: detail_level.level_name,
      },
    };

    res.json(result);
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// Untuk Menampilkan Seluruh Datanya
const get_all_levels = async (req, res) => {
  try {
    const {
      limit = null,
      keyword = "",
      page = null,
      order = { level_id: "desc" },
      filter = {},
    } = req.query;

    const offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField].toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      level_delete_at: null,
    };

    if (keyword) {
      whereClause.level_name = {
        [Sequelize.Op.like]: `%${keyword}%`,
      };
    }

    if (filter) {
      for (const field in filter) {
        if (Array.isArray(filter[field])) {
          whereClause[field] = {
            [Sequelize.Op.in]: filter[field],
          };
        }
      }
    }

    const data = await tbl_levels.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
    });

    if (data.count === 0) {
      return res.status(200).json({
        success: true,
        message: "Gagal mendapatkan data",
        data: [],
        pages: {
          total: 0,
          per_page: limit || 0,
          next_page: null,
          to: 0,
          last_page: 0,
          current_page: page || 1,
          from: 0,
        },
      });
    }

    const totalPages = limit ? Math.ceil(data.count / limit) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((level) => ({
        level_uuid: level.level_uuid,
        level_name: level.level_name,
      })),
      pages: {
        total: data.count,
        per_page: limit || data.count,
        next_page: limit && page ? (page < totalPages ? page + 1 : null) : null,
        to: limit ? offset + data.rows.length : data.count,
        last_page: totalPages,
        current_page: page || 1,
        from: offset,
      },
    };
    res.status(200).json(result);
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// Untuk mendapatkan Data yang uniqe
const get_unique_levels = async (req, res) => {
  try {
    const { field } = req.query;

    if (!field) {
      return res.status(400).json({
        success: false,
        message: 'Parameter "field" diperlukan.',
        data: null,
      });
    }

    const tableAttributes = tbl_levels.rawAttributes;

    if (!(field in tableAttributes)) {
      return res.status(404).json({
        success: false,
        message: 'Gagal mendapatkan data',
        data: null,
      });
    }

    const uniqueValues = await tbl_levels.findAll({
      attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(field)), field]],
      where: {
        level_delete_at: null,
      },
    });

    if (!uniqueValues || uniqueValues.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Gagal mendapatkan data',
        data: null,
      });
    }

    const values = uniqueValues.map((item) => item[field]);

    return res.status(200).json({
      success: true,
      message: 'Sukses mendapatkan data',
      data: {
        [field]: values,
      },
    });
  } catch (error) {
    console.error(error, 'Data Error');
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null,
    });
  }
};

// Untuk Mendapatkan Jumlah Data Pada Database
const get_count_levels = async (req, res) => {
  try {
    const { field } = req.query;

    if (!field || typeof field !== "object") {
      return res.status(400).json({
        success: false,
        message: "Parameter field harus berupa objek",
        data: null,
      });
    }

    const counts = {};

    for (const fieldName in field) {
      if (field.hasOwnProperty(fieldName)) {
        const values = Array.isArray(field[fieldName])
          ? field[fieldName]
          : field[fieldName].split(",").map((val) => val.trim()); 

        const valueCounts = {}; 

        for (const value of values) {
          const count = await tbl_levels.count({
            where: {
              [fieldName]: {
                [Sequelize.Op.not]: null, 
                [Sequelize.Op.eq]: value, 
              },
            },
          });

          valueCounts[value] = count;
        }

        const hasData = Object.values(valueCounts).some((count) => count > 0);

        counts[fieldName] = hasData
          ? Object.keys(valueCounts).map((value) => ({
              value,
              count: valueCounts[value],
            }))
          : null;
      }
    }

    const hasData = Object.values(counts).some((data) => data !== null);

    const response = {
      success: hasData, 
      message: hasData ? "Sukses mendapatkan data" : "Gagal mendapatkan data",
      data: hasData ? counts : null,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Internal server error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = {
  post_levels,
  put_levels,
  delete_levels,
  get_all_levels,
  get_detail_level,
  get_unique_levels,
  get_count_levels,
};
