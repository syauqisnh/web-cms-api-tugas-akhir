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
        message: "Belum ada data yang di isi",
        data: null,
      });
    }

    const modulValid = await tbl_modules.findOne({
      where: { module_uuid: access_modul },
    });
    const permissionValid = await tbl_permissions.findOne({
      where: { permission_uuid: access_permission },
    });
    const levelValid = await tbl_levels.findOne({
      where: { level_uuid: access_level },
    });

    if (!modulValid || !permissionValid || !levelValid) {
      return res.status(400).json({
        success: false,
        message: "UUID tidak terdapat di tabel referensi",
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
    console.log(error, "Data Error");
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

    if (!new_update) {
      return res.status(404).json({
        success: false,
        message: "Gagal merubah data",
        data: null,
      });
    }

    new_update.access_modul = access_modul;
    await new_update.save();

    new_update.access_permission = access_permission;
    await new_update.save();

    new_update.access_level = access_level;
    await new_update.save();

    new_update.access_update_at = new Date();
    await new_update.save();

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        access_modul: new_update.access_modul,
        access_permission: new_update.access_permission,
        access_level: new_update.access_level,
        access_create_at: new_update.access_create_at,
        access_update_at: new_update.access_update_at,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
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
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const get_all_access = async (req, res) => {
  try {
    const {
      limit = null,
      page = null,
      keyword = "",
      order = { access_id: "desc" },
      filter = {},
    } = req.query;

    let offset = limit && page ? (page - 1) * limit : 0;
    const validOrderFields = Object.keys(tbl_access.rawAttributes);
    const orderField = Object.keys(order)[0];
    const orderDirection = order[orderField];
    const isValidOrderField = validOrderFields.includes(orderField);

    const whereClause = {
      access_delete_at: null,
      ...(filter.access_modul
        ? { access_modul: filter.access_modul.split(",") }
        : null),
      ...(filter.access_permission
        ? { access_permission: filter.access_permission.split(",") }
        : null),
      ...(filter.access_level
        ? { access_level: filter.access_level.split(",") }
        : null),
    };

    if (keyword) {
      const keywordClause = {
        [Sequelize.Op.or]: [
          Sequelize.literal("`access_modul_as`.`module_name` LIKE :keyword"),
        ],
      };
      offset = 0;

      whereClause.access_modul = whereClause.access_modul
        ? { [Sequelize.Op.and]: [whereClause.access_modul, keywordClause] }
        : keywordClause;
    }

    let orderQuery;
    if (orderField === "modul_name") {
      orderQuery = [["access_modul_as", "module_name", orderDirection]];
    } else if (orderField === "permission_name") {
      orderQuery = [
        ["access_permission_as", "permission_name", orderDirection],
      ];
    } else if (orderField === "level_name") {
      orderQuery = [["access_level_as", "level_name", orderDirection]];
    } else if (isValidOrderField) {
      orderQuery = [[orderField, orderDirection]];
    } else {
      orderQuery = [["access_uuid", "DESC"]];
    }

    const { count, rows } = await tbl_access.findAndCountAll({
      where: whereClause,
      order: orderQuery,
      limit: limit ? parseInt(limit) : null,
      offset: offset,
      include: [
        {
          model: tbl_modules,
          as: "access_modul_as",
          attributes: ["module_uuid", "module_name"],
          where: {
            ...(filter.modul_uuid
              ? { module_uuid: filter.modul_uuid.split(",") }
              : null),
            ...(filter.modul_name
              ? { module_name: filter.modul_name.split(",") }
              : null),
          },
        },
        {
          model: tbl_permissions,
          as: "access_permission_as",
          attributes: ["permission_uuid", "permission_name"],
          where: {
            ...(filter.permission_uuid
              ? { permission_uuid: filter.permission_uuid.split(",") }
              : null),
            ...(filter.permission_name
              ? { permission_name: filter.permission_name.split(",") }
              : null),
          },
        },
        {
          model: tbl_levels,
          as: "access_level_as",
          attributes: ["level_uuid", "level_name"],
          where: {
            ...(filter.level_uuid
              ? { level_uuid: filter.level_uuid.split(",") }
              : null),
            ...(filter.level_name
              ? { level_name: filter.level_name.split(",") }
              : null),
          },
        },
      ],
      replacements: {
        keyword: `%${keyword}%`,
      },
    });

    const uniqueData = new Set();

    const uniqueRows = rows.filter((row) => {
      const key = `${row.access_uuid}-${row.access_modul_as.module_uuid}-${row.access_permission_as.permission_uuid}-${row.access_level_as.level_uuid}`;
      if (uniqueData.has(key)) {
        return false;
      }
      uniqueData.add(key);
      return true;
    });

    console.log("Access Data:", uniqueRows);

    const totalPages = Math.ceil(count / limit);

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: uniqueRows.map((row) => ({
        access_uuid: row.access_uuid,
        access_modul: row.access_modul_as
          ? {
              modul_uuid: row.access_modul_as.module_uuid,
              modul_name: row.access_modul_as.module_name,
            }
          : null,
        access_permission: row.access_permission_as
          ? {
              permission_uuid: row.access_permission_as.permission_uuid,
              permission_name: row.access_permission_as.permission_name,
            }
          : null,
        access_level: row.access_level_as
          ? {
              level_uuid: row.access_level_as.level_uuid,
              level_name: row.access_level_as.level_name,
            }
          : null,
      })),
      pages: {
        total: totalPages,
        per_page: limit ? parseInt(limit) : count,
        next_page: limit && page ? (page < totalPages ? page + 1 : null) : null,
        to: offset + uniqueRows.length,
        last_page: totalPages,
        current_page: parseInt(page),
        from: offset,
      },
    };

    const currentUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const excludePagesUrl = "http://localhost:9900/api/v1/access/get_all";

    if (currentUrl === excludePagesUrl) {
      delete result.pages;
    }

    res.status(200).json(result);
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const get_detail_access = async (req, res) => {
  try {
    const { access_uuid } = req.params;

    const detail_access = await tbl_access.findOne({
      where: {
        access_uuid,
        access_delete_at: null,
      },
      include: [
        {
          model: tbl_modules,
          as: "access_modul_as",
          attributes: ["module_uuid", "module_name"],
        },
        {
          model: tbl_permissions,
          as: "access_permission_as",
          attributes: ["permission_uuid", "permission_name"],
        },
        {
          model: tbl_levels,
          as: "access_level_as",
          attributes: ["level_uuid", "level_name"],
        },
      ],
    });

    if (!detail_access) {
      return res.status(404).json({
        success: false,
        message: "Gagal mendapatkan data",
        data: null,
      });
    }

    const result = {
      success: true,
      message: "Berhasil mendapatkan data",
      data: {
        access_uuid: detail_access.access_uuid,
        access_modul: detail_access.access_modul_as
          ? {
              modul_uuid: detail_access.access_modul_as.module_uuid,
              modul_name: detail_access.access_modul_as.module_name,
            }
          : null,
        access_permission: detail_access.access_permission_as
          ? {
              permission_uuid:
                detail_access.access_permission_as.permission_uuid,
              permission_name:
                detail_access.access_permission_as.permission_name,
            }
          : null,
        access_level: detail_access.access_level_as
          ? {
              level_uuid: detail_access.access_level_as.level_uuid,
              level_name: detail_access.access_level_as.level_name,
            }
          : null,
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

const get_unique_access = async (req, res) => {
  try {
    const { field } = req.query;

    if (!field) {
      return res.status(400).json({
        success: false,
        message: 'Parameter "field" diperlukan',
        data: null,
      });
    }

    const pemetaanFieldURLkeDB = {
      modul_name: "access_modul",
      level_name: "access_level",
      permission_name: "access_permission"
    };

    const rawFieldsArray = field.split(",");
    const fieldsArray = rawFieldsArray.map(f => pemetaanFieldURLkeDB[f] || f);

    const tableAttributes = tbl_access.rawAttributes;
    const invalidFields = fieldsArray.filter((f) => !(f in tableAttributes));

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Parameter tidak valid (kolom tidak ditemukan): " + invalidFields.join(", "),
        data: null,
      });
    }

    const fieldMappings = {
      access_modul: { model: tbl_modules, as: "access_modul_as", column: "module_name" },
      access_permission: { model: tbl_permissions, as: "access_permission_as", column: "permission_name" },
      access_level: { model: tbl_levels, as: "access_level_as", column: "level_name" }
    };

    const uniqueValues = {};

    for (let i = 0; i < fieldsArray.length; i++) {
      const f = fieldsArray[i];
      const rawField = rawFieldsArray[i];
      const mapping = fieldMappings[f];

      if (mapping) {
        const values = await tbl_access.findAll({
          attributes: [[Sequelize.literal(`DISTINCT ${mapping.as}.${mapping.column}`), mapping.column]],
          include: [{ model: mapping.model, as: mapping.as, attributes: [] }],
          where: { access_delete_at: null },
          raw: true,
        });
        uniqueValues[rawField] = values.map((item) => item[mapping.column]);
      } else {
        const otherValues = await tbl_access.findAll({
          attributes: [[Sequelize.literal(`DISTINCT \`${f}\``), f]],
          where: { access_delete_at: null },
          raw: true,
        });
        uniqueValues[rawField] = otherValues.map((item) => item[f]);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Sukses mendapatkan data unik",
      data: uniqueValues,
    });
  } catch (error) {
    console.log(error, "Data Error")
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      data: null,
    });
  }
};

const get_count_access = async (req, res) => {
  try {
    const { field } = req.query;

    if (!field) {
      return res.status(400).json({
        success: false,
        message: 'Parameter "field" diperlukan',
        data: null,
      });
    }

    const tableAttributes = tbl_access.rawAttributes;
    const fieldNames = Object.keys(field);

    const invalidFields = fieldNames.filter(
      (fieldName) => !(fieldName in tableAttributes)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Nama kolom tidak valid: " + invalidFields.join(", "),
        data: null,
      });
    }

    const resultData = {};

    for (const fieldName of fieldNames) {
      const fieldValues = field[fieldName].split(",");

      let relatedModel, relatedAs, relatedNameColumn;

      if (fieldName === "access_modul") {
        relatedModel = tbl_modules;
        relatedAs = "access_modul_as";
        relatedNameColumn = "module_name";
      } else if (fieldName === "access_permission") {
        relatedModel = tbl_permissions;
        relatedAs = "access_permission_as";
        relatedNameColumn = "permission_name";
      } else {
        relatedModel = tbl_levels;
        relatedAs = "access_level_as";
        relatedNameColumn = "level_name";
      }

      const counts = await tbl_access.findAll({
        attributes: [
          [Sequelize.col(`${relatedAs}.${relatedNameColumn}`), "value"],
          [
            Sequelize.fn(
              "COUNT",
              Sequelize.col(`${relatedAs}.${relatedNameColumn}`)
            ),
            "count",
          ],
        ],
        where: {
          [fieldName]: {
            [Sequelize.Op.in]: fieldValues,
          },
          access_delete_at: null,
        },
        include: [
          {
            model: relatedModel,
            attributes: [],
            as: relatedAs,
          },
        ],
        group: [Sequelize.col(`${relatedAs}.${relatedNameColumn}`)],
        raw: true,
      });

      if (counts.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Data tidak ditemukan untuk field " + fieldName,
          data: null,
        });
      }

      resultData[fieldName] = counts;
    }

    res.status(200).json({
      success: true,
      message: "Sukses mendapatkan data",
      data: resultData,
    });
  } catch (error) {
    console.log(error, "Data Error")
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      data: null,
    });
  }
};

module.exports = {
  post_access,
  put_access,
  delete_access,
  get_all_access,
  get_detail_access,
  get_count_access,
  get_unique_access,
};
