const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');
const db = require('../models');
const tbl_practice_schedule = db.tbl_practice_schedule;
const tbl_business = db.tbl_business;
const tbl_teams = db.tbl_teams;
const tbl_service = db.tbl_service;
const tbl_customer = db.tbl_customer;
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const jwt = require("jsonwebtoken");

// Define schema for validation
const scheduleSchema = Joi.object({
  doctor_name: Joi.string().required().messages({
    'string.empty': 'Nama dokter tidak boleh kosong'
  }),
  doctor_position: Joi.string().required().messages({
    'string.empty': 'Jabatan dokter tidak boleh kosong'
  }),
  practice_business: Joi.string().required().messages({
    'string.empty': 'Bisnis harus di isi tidak boleh kosong'
  }),
  practice_date: Joi.date().required().messages({
    'date.base': 'Tanggal praktik harus berupa tanggal',
    'any.required': 'Tanggal praktik tidak boleh kosong'
  }),
  practice_start: Joi.string().required().messages({
    'string.base': 'Waktu mulai praktik harus berupa string waktu',
    'any.required': 'Waktu mulai praktik tidak boleh kosong'
  }),
  practice_end: Joi.string().required().messages({
    'string.base': 'Waktu selesai praktik harus berupa string waktu',
    'any.required': 'Waktu selesai praktik tidak boleh kosong'
  }),
});

const updateSchema = Joi.object({
  doctor_name: Joi.string().optional(),
  doctor_position: Joi.string().optional(),
  practice_business: Joi.string().optional(),
  practice_date: Joi.date().optional(),
  practice_start: Joi.string().optional(),
  practice_end: Joi.string().optional(),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    dokter_name: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});

const querySchemaCustomer = Joi.object({
  practice_business: Joi.string().guid({ version: "uuidv4" }).optional(),
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    doctor_name: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});

const uuidSchema = Joi.object({
  practice_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
});

const post_practice_schedule = async (req, res) => {
  try {
    const { error, value } = scheduleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const {
      doctor_name,
      doctor_position,
      practice_business,
      practice_date,
      practice_start,
      practice_end,
    } = value;

    const layananValid = await tbl_service.findOne({
      where: { service_uuid: doctor_position },
    });
    if (!layananValid) {
      return res.status(400).json({
        success: false,
        message: "Data tidak ditemukan",
        data: null,
      });
    }

    const teamsValid = await tbl_teams.findOne({
      where: { team_uuid: doctor_name },
    });
    if (!teamsValid) {
      return res.status(400).json({
        success: false,
        message: "Data tidak ditemukan",
        data: null,
      });
    }

    const businessValid = await tbl_business.findOne({
      where: { business_uuid: practice_business },
    });
    if (!businessValid) {
      return res.status(400).json({
        success: false,
        message: "Data tidak ditemukan",
        data: null,
      });
    }

    const practice_uuid = uuidv4();
    const practice_create_at = Math.floor(Date.now() / 1000); // Current time in UNIX Epoch

    const create_practice_schedule = await tbl_practice_schedule.create({
      practice_uuid,
      doctor_name,
      doctor_position,
      practice_business,
      practice_date,
      practice_start,
      practice_end,
      practice_create_at,
    });

    if (!create_practice_schedule) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data",
        data: null,
      });
    }

    const formatted_practice_date = moment(practice_date).format('YYYY-MM-DD');
    const formatted_practice_start = moment(practice_start, 'HH:mm:ss').format('HH:mm:ss');
    const formatted_practice_end = moment(practice_end, 'HH:mm:ss').format('HH:mm:ss');
    const formatted_practice_create_at = moment.unix(practice_create_at).tz("Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss');

    res.status(200).json({
      success: true,
      message: "Berhasil menambahkan data",
      data: {
        practice_uuid,
        doctor_name,
        doctor_position,
        practice_business,
        practice_date: formatted_practice_date,
        practice_start: formatted_practice_start,
        practice_end: formatted_practice_end,
        practice_create_at: formatted_practice_create_at,
      },
    });
  } catch (error) {
    console.error("Data Error", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const put_practice_schedule = async (req, res) => {
  try {
    const practice_uuid = req.params.practice_uuid;
    const { error, value } = updateSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const update_practice = await tbl_practice_schedule.findOne({
      where: { practice_uuid },
    });

    if (!update_practice) {
      return res.status(404).json({
        success: false,
        message: "Gagal merubah data",
        data: null,
      });
    }

    if (value.practice_business && value.practice_business !== update_practice.practice_business) {
      const existingPractice = await tbl_practice_schedule.findOne({
        where: {
          practice_business: value.practice_business,
          practice_uuid: { [Op.ne]: practice_uuid },
          practice_delete_at: null
        },
      });

      if (existingPractice) {
        return res.status(400).json({
          success: false,
          message: "Data Sudah di Gunakan",
          data: null,
        });
      }
    }

    await update_practice.update({
      doctor_name: value.doctor_name || update_practice.doctor_name,
      doctor_position: value.doctor_position || update_practice.doctor_position,
      practice_date: value.practice_date || update_practice.practice_date,
      practice_start: value.practice_start || update_practice.practice_start,
      practice_end: value.practice_end || update_practice.practice_end,
      practice_business: value.practice_business || update_practice.practice_business,
      practice_update_at: Math.floor(Date.now() / 1000),
    });

    // Format response dates
    const formatted_practice_date = moment(update_practice.practice_date).format('YYYY-MM-DD');
    const formatted_practice_start = moment(update_practice.practice_start, 'HH:mm:ss').format('HH:mm:ss');
    const formatted_practice_end = moment(update_practice.practice_end, 'HH:mm:ss').format('HH:mm:ss');
    const formatted_practice_update_at = moment.unix(update_practice.practice_update_at).tz("Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss');

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        practice_uuid: update_practice.practice_uuid,
        doctor_name: update_practice.doctor_name,
        doctor_position: update_practice.doctor_position,
        practice_date: formatted_practice_date,
        practice_start: formatted_practice_start,
        practice_end: formatted_practice_end,
        practice_business: update_practice.practice_business,
        practice_update_at: formatted_practice_update_at,
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

const delete_practice_schedule = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { practice_uuid } = value;

    const delete_practice = await tbl_practice_schedule.findOne({
      where: { practice_uuid },
    });

    if (!delete_practice) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data",
        data: null,
      });
    }

    await delete_practice.update({ practice_delete_at: new Date() });

    res.json({
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

const get_detail_practice_schedule = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { practice_uuid } = value;

    const detail_practice = await tbl_practice_schedule.findOne({
      where: {
        practice_uuid,
        practice_delete_at: null,
      },
      include: [
        {
          model: tbl_business,
          as: "practice_business_as",
          attributes: [
            "business_uuid",
            "business_name",
            "business_desc",
            "business_province",
            "business_regency",
            "business_subdistrict",
            "business_address",
          ],
        },
        {
          model: tbl_teams,
          as: "teams_practice_as",
          attributes: [
            "team_uuid",
            "team_name",
          ],
        },
        {
          model: tbl_service,
          as: "service_practice_as",
          attributes: [
            "service_uuid",
            "service_name",
          ],
        },
      ],
    });

    if (!detail_practice) {
      return res.status(404).json({
        success: false,
        message: "Gagal Mendapatkan Data",
        data: null,
      });
    }

    const result = {
      success: true,
      message: "Berhasil Mendapatkan Data",
      data: {
        practice_uuid: detail_practice.practice_uuid,
        doctor_name: detail_practice.teams_practice_as
          ? {
              team_uuid: detail_practice.teams_practice_as.team_uuid,
              team_name: detail_practice.teams_practice_as.team_name,
            }
          : null,
        doctor_position: detail_practice.service_practice_as
          ? {
              service_uuid: detail_practice.service_practice_as.service_uuid,
              service_name: detail_practice.service_practice_as.service_name,
            }
          : null,
        practice_date: detail_practice.practice_date,
        practice_start: detail_practice.practice_start,
        practice_end: detail_practice.practice_end,
        practice_business: detail_practice.practice_business_as
          ? {
              business_uuid: detail_practice.practice_business_as.business_uuid,
              business_name: detail_practice.practice_business_as.business_name,
              business_desc: detail_practice.practice_business_as.business_desc,
              business_province:
                detail_practice.practice_business_as.business_province,
              business_regency: detail_practice.practice_business_as.business_regency,
              business_subdistrict:
                detail_practice.practice_business_as.business_subdistrict,
              business_address: detail_practice.practice_business_as.business_address,
            }
          : null,
      },
    };

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

const get_all_practice_schedule = async (req, res) => {
  try {
    const { error, value } = querySchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const {
      limit = null,
      page = null,
      keyword = "",
      filter = {},
      order = { practice_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      practice_delete_at: null,
    };

    if (filter.doctor_name) {
      const filterNames = Array.isArray(filter.doctor_name)
        ? filter.doctor_name
        : filter.doctor_name.split(",");

      if (filterNames.length > 0) {
        whereClause.doctor_name = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.doctor_name");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }
    if (keyword) {
      const keywordClause = {
        [Sequelize.Op.or]: [
          { doctor_name: { [Sequelize.Op.like]: `%${keyword}%` } },
          // { '$practice_business_as.business_name$': { [Sequelize.Op.like]: `%${keyword}%` } }
        ]
      };
      offset = 0;
    
      whereClause[Sequelize.Op.and] = whereClause[Sequelize.Op.and]
        ? [...whereClause[Sequelize.Op.and], keywordClause]
        : [keywordClause];
    }

    const data = await tbl_practice_schedule.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
          model: tbl_teams,
          as: "teams_practice_as",
          where: {
            team_delete_at: null, 
          },
          attributes: [
            "team_uuid",
            "team_name",
          ],
        },
        {
          model: tbl_service,
          as: "service_practice_as",
          attributes: [
            "service_uuid",
            "service_name",
          ],
        },
        {
          model: tbl_business,
          as: "practice_business_as",
          where: {
            business_delete_at: null, 
          },
          attributes: [
            "business_uuid",
            "business_name",
            "business_desc",
            "business_province",
            "business_regency",
            "business_subdistrict",
            "business_address",
            "business_customer",
          ],
        },
      ],
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((practice) => ({
        practice_uuid: practice.practice_uuid,
        doctor_name: practice.teams_practice_as ? {
          team_uuid: practice.teams_practice_as.team_uuid,
          team_name: practice.teams_practice_as.team_name,
        } : null,
        doctor_position: practice.service_practice_as ? {
          service_uuid: practice.service_practice_as.service_uuid,
          service_name: practice.service_practice_as.service_name,
        } : null,
        practice_date: practice.practice_date,
        practice_start: practice.practice_start,
        practice_end: practice.practice_end,
        practice_business: practice.practice_business_as
          ? {
              business_uuid: practice.practice_business_as.business_uuid,
              business_name: practice.practice_business_as.business_name,
              business_desc: practice.practice_business_as.business_desc,
              business_province: practice.practice_business_as.business_province,
              business_regency: practice.practice_business_as.business_regency,
              business_subdistrict:
                practice.practice_business_as.business_subdistrict,
              business_address: practice.practice_business_as.business_address,
              business_customer: practice.practice_business_as.business_customer,
            }
          : null,
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

    if (data.count === 0) {
      return res.status(200).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null,
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

    const currentUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const excludePagesUrl = "http://localhost:9900/api/v1/practice/get_all";

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

const get_all_practice_schedule_customer = async (req, res) => {
  try {
    const { error, value } = querySchemaCustomer.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    let uuid;
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Tidak ada token JWT yang ditemukan di cookie!",
      });
    }

    const customerUuid = jwt.verify(token, process.env.JWT_SECRET);
    uuid = customerUuid.uuid;

    const customer = await tbl_customer.findOne({
      attributes: ["customer_uuid", "customer_username"],
      where: {
        customer_uuid: uuid,
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "User Tidak DI Temukan",
        data: null,
      });
    }

    const {
      practice_business = null,
      limit = null,
      page = null,
      keyword = "",
      filter = {},
      order = { practice_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      [Op.and]: [
        { practice_delete_at: null },
        {
          [Op.or]: [
            {
              practice_business: practice_business
                ? practice_business
                : { [Op.ne]: null },
            },
            { "$teams_practice_as.team_name$": { [Op.like]: `%${keyword}%` } },
          ],
        },
        Sequelize.where(
          Sequelize.col("practice_business_as.business_customer"),
          uuid
        ),
      ],
    };

    if (filter.doctor_name) {
      const filterNames = Array.isArray(filter.doctor_name)
        ? filter.doctor_name
        : filter.doctor_name.split(",");

      if (filterNames.length > 0) {
        whereClause[Op.and].push({
          doctor_name: {
            [Op.or]: filterNames.map((name) => ({
              [Op.like]: `%${name.trim()}%`,
            })),
          },
        });
      } else {
        console.log("Empty filter.doctor_name");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }

    if (keyword) {
      const keywordClause = {
        [Sequelize.Op.or]: [
          {
            "$teams_practice_as.team_name$": {
              [Sequelize.Op.like]: `%${keyword}%`,
            },
          },
        ],
      };
      offset = 0;

      whereClause[Sequelize.Op.and] = whereClause[Sequelize.Op.and]
        ? [...whereClause[Sequelize.Op.and], keywordClause]
        : [keywordClause];
    }

    const data = await tbl_practice_schedule.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
          model: tbl_teams,
          as: "teams_practice_as",
          where: {
            team_delete_at: null, 
          },
          attributes: [
            "team_uuid",
            "team_name",
          ],
        },
        {
          model: tbl_service,
          as: "service_practice_as",
          attributes: [
            "service_uuid",
            "service_name",
          ],
        },
        {
          model: tbl_business,
          as: "practice_business_as",
          where: {
            business_delete_at: null, 
          },
          attributes: [
            "business_uuid",
            "business_name",
            "business_desc",
            "business_province",
            "business_regency",
            "business_subdistrict",
            "business_address",
            "business_customer",
          ],
        },
      ],
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((practice) => ({
        practice_uuid: practice.practice_uuid,
        doctor_name: practice.teams_practice_as ? {
          team_uuid: practice.teams_practice_as.team_uuid,
          team_name: practice.teams_practice_as.team_name,
        } : null,
        doctor_position: practice.service_practice_as ? {
          service_uuid: practice.service_practice_as.service_uuid,
          service_name: practice.service_practice_as.service_name,
        } : null,
        practice_date: practice.practice_date,
        practice_start: practice.practice_start,
        practice_end: practice.practice_end,
        practice_business: practice.practice_business_as
          ? {
              business_uuid: practice.practice_business_as.business_uuid,
              business_name: practice.practice_business_as.business_name,
              business_desc: practice.practice_business_as.business_desc,
              business_province: practice.practice_business_as.business_province,
              business_regency: practice.practice_business_as.business_regency,
              business_subdistrict:
                practice.practice_business_as.business_subdistrict,
              business_address: practice.practice_business_as.business_address,
              business_customer: practice.practice_business_as.business_customer,
            }
          : null,
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

    if (data.count === 0) {
      return res.status(200).json({
        success: false,
        message: "Data Tidak Ditemukan",
        data: null,
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
    res.status(200).json(result);
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
}

const get_all_byLayanan = async (req, res) => {try {
  const { layanan_uuid } = req.params;

  const dokter = await tbl_practice_schedule.findAll({
    where: { doctor_position: layanan_uuid },
    attributes: ['doctor_name'],
    include: [
      {
        model: tbl_teams,
        as: "teams_practice_as",
        where: {
          team_delete_at: null,
        },
        attributes: [
          "team_uuid",
          "team_name",
        ],
      },
    ]
  });

  if (!dokter) {
    res.status(400).json({
      success: false,
      message: 'Dokter Tidak Tersedia',
      data: dokter
    });
  }

  const uniqueDokter = [];
  const teamUuids = new Set();

  dokter.forEach(item => {
    if (!teamUuids.has(item.teams_practice_as.team_uuid)) {
      uniqueDokter.push(item);
      teamUuids.add(item.teams_practice_as.team_uuid);
    }
  });

  res.status(200).json({
    success: true,
    message: 'Waktu yang tersedia berhasil diambil',
    data: uniqueDokter
  });
} catch (error) {
  console.log(error, 'Kesalahan Data');
  res.status(500).json({
    success: false,
    message: 'Kesalahan server internal',
    data: null
  });
}
  // try {
  //   const { layanan_uuid } = req.params;

  //   // Ambil semua jadwal yang sudah ada untuk tanggal yang dipilih
  //   const dokter = await tbl_practice_schedule.findAll({
  //     where: { doctor_position: layanan_uuid },
  //     attributes: ['doctor_name'],
  //     include: [
  //       {
  //         model: tbl_teams,
  //         as: "teams_practice_as",
  //         where: {
  //           team_delete_at: null, 
  //         },
  //         attributes: [
  //           "team_uuid",
  //           "team_name",
  //         ],
  //       },
  //     ]
  //   });

  //   if (!dokter) {
  //     res.status(400).json({
  //       success: false,
  //       message: 'Dokter Tidak Tersedia',
  //       data: dokter
  //     });
  //   }

  //   res.status(200).json({
  //     success: true,
  //     message: 'Waktu yang tersedia berhasil diambil',
  //     data: dokter
  //   });
  // } catch (error) {
  //   console.log(error, 'Kesalahan Data');
  //   res.status(500).json({
  //     success: false,
  //     message: 'Kesalahan server internal',
  //     data: null
  //   });
  // }
};

const get_all_byDokter = async (req, res) => {try {
  const { dokter_uuid } = req.params;

  const jadwal = await tbl_practice_schedule.findAll({
    where: { doctor_name: dokter_uuid, practice_delete_at: null },
    attributes: ['practice_date'],
  });

  if (!jadwal || jadwal.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'jadwal Tidak Tersedia',
      data: null
    });
  }

  // Filter out duplicate practice_date values
  const uniqueJadwal = Array.from(new Set(jadwal.map(item => item.practice_date)))
                             .map(date => ({ practice_date: date }));

  res.status(200).json({
    success: true,
    message: 'jadwal yang tersedia berhasil diambil',
    data: uniqueJadwal
  });
} catch (error) {
  console.log(error, 'Kesalahan Data');
  res.status(500).json({
    success: false,
    message: 'Kesalahan server internal',
    data: null
  });
}

  // try {
  //   const { dokter_uuid } = req.params;

  //   const jadwal = await tbl_practice_schedule.findAll({
  //     where: { doctor_name: dokter_uuid, practice_delete_at: null },
  //     attributes: ['practice_date'],
      // include: [
      //   {
      //     model: tbl_teams,
      //     as: "teams_practice_as",
      //     where: {
      //       team_delete_at: null, 
      //     },
      //     attributes: [
      //       "team_uuid",
      //       "team_name",
      //     ],
      //   },
      // ]
  //   });

  //   if (!jadwal) {
  //     res.status(400).json({
  //       success: false,
  //       message: 'jadwal Tidak Tersedia',
  //       data: null
  //     });
  //   }

  //   res.status(200).json({
  //     success: true,
  //     message: 'jadwal yang tersedia berhasil diambil',
  //     data: jadwal
  //   });
  // } catch (error) {
  //   console.log(error, 'Kesalahan Data');
  //   res.status(500).json({
  //     success: false,
  //     message: 'Kesalahan server internal',
  //     data: null
  //   });
  // }
};

const get_all_byBusiness = async (req, res) => {
  try {
    const { business_uuid } = req.params;
    const { keyword } = req.query;

    const jadwal = await tbl_practice_schedule.findAll({
      where: {
        practice_business: business_uuid,
        practice_delete_at: null,
        ...keyword ? { '$service_practice_as.service_name$': keyword } : {},
      },
      attributes: ['practice_uuid', 'practice_date', 'practice_start', 'practice_end'],
      include: [
        {
          model: tbl_teams,
          as: "teams_practice_as",
          where: {
            team_delete_at: null,
          },
          attributes: [
            "team_uuid",
            "team_name",
          ],
        },
        {
          model: tbl_service,
          as: "service_practice_as",
          attributes: [
            "service_uuid",
            "service_name",
          ],
        },
        {
          model: tbl_business,
          as: "practice_business_as",
          attributes: [
            "business_uuid",
            "business_name",
            "business_desc",
            "business_province",
            "business_regency",
            "business_subdistrict",
            "business_address",
            "business_customer"
          ],
        }
      ]
    });

    if (!jadwal || jadwal.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Jadwal tidak tersedia',
        data: null
      });
    }

    const formattedData = jadwal.map(item => ({
      practice_uuid: item.practice_uuid,
      doctor_name: {
        team_uuid: item.teams_practice_as.team_uuid,
        team_name: item.teams_practice_as.team_name
      },
      doctor_position: {
        service_uuid: item.service_practice_as.service_uuid,
        service_name: item.service_practice_as.service_name // Mengambil service_name
      },
      practice_date: item.practice_date,
      practice_start: item.practice_start,
      practice_end: item.practice_end,
      practice_business: {
        business_uuid: item.practice_business_as.business_uuid,
        business_name: item.practice_business_as.business_name,
        business_desc: item.practice_business_as.business_desc,
        business_province: item.practice_business_as.business_province,
        business_regency: item.practice_business_as.business_regency,
        business_subdistrict: item.practice_business_as.business_subdistrict,
        business_address: item.practice_business_as.business_address,
        business_customer: item.practice_business_as.business_customer
      }
    }));

    res.status(200).json({
      success: true,
      message: 'Sukses mendapatkan data',
      data: formattedData
    });
  } catch (error) {
    console.log(error, 'Kesalahan Data');
    res.status(500).json({
      success: false,
      message: 'Kesalahan server internal',
      data: null
    });
  }
}



module.exports = {
  post_practice_schedule,
  put_practice_schedule,
  delete_practice_schedule,
  get_all_practice_schedule,
  get_detail_practice_schedule,
  get_all_byLayanan,
  get_all_byBusiness,
  get_all_practice_schedule_customer,
  get_all_byDokter,
};
