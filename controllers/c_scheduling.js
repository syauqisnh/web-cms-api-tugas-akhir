const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment-timezone');
const db = require('../models');
const tbl_scheduling = db.tbl_scheduling;
const tbl_practice_schedule = db.tbl_practice_schedule;
const tbl_business = db.tbl_business;
const tbl_teams = db.tbl_teams;
const tbl_service = db.tbl_service;
const tbl_customer = db.tbl_customer;
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");

// Skema validasi untuk penjadwalan janji temu baru
const scheduleSchema = Joi.object({
  schedule_name_pasien: Joi.string().required().messages({
    'string.empty': 'Nama pasien tidak boleh kosong'
  }),
  schedule_noHp_pasien: Joi.string().required().messages({
    'string.empty': 'Nomor HP pasien tidak boleh kosong'
  }),
  schedule_address: Joi.string().required().messages({
    'string.empty': 'Alamat tidak boleh kosong'
  }),
  schedule_date: Joi.string().isoDate().required().messages({
    'string.empty': 'Tanggal tidak boleh kosong',
    'string.isoDate': 'Tanggal harus dalam format YYYY-MM-DD'
  }),
  schedule_start_practice: Joi.string().required().messages({
    'string.empty': 'Waktu mulai praktik tidak boleh kosong'
  }),
  schedule_practice: Joi.string().required().messages({
    'string.empty': 'UUID harus diisi'
  }),
  schedule_business: Joi.string().required().messages({
    'string.empty': 'UUID harus diisi'
  }),
  schedule_doctor: Joi.string().required().messages({
    'string.empty': 'UUID harus diisi'
  }),
});

const putScheduleSchema = Joi.object({
  schedule_name_pasien: Joi.string().messages({
    'string.empty': 'Nama pasien tidak boleh kosong'
  }),
  schedule_noHp_pasien: Joi.string().messages({
    'string.empty': 'Nomor HP pasien tidak boleh kosong'
  }),
  schedule_address: Joi.string().messages({
    'string.empty': 'Alamat tidak boleh kosong'
  }),
  schedule_date: Joi.string().isoDate().messages({
    'string.empty': 'Tanggal tidak boleh kosong',
    'string.isoDate': 'Tanggal harus dalam format YYYY-MM-DD'
  }),
  schedule_start_practice: Joi.string().messages({
    'string.empty': 'Waktu mulai praktik tidak boleh kosong'
  }),
  schedule_practice: Joi.string().messages({
    'string.empty': 'UUID harus diisi'
  }),
  schedule_business: Joi.string().messages({
    'string.empty': 'UUID harus diisi'
  }),
  schedule_doctor: Joi.string().messages({
    'string.empty': 'UUID harus diisi'
  }),
  schedule_status: Joi.string().valid('Y', 'N').messages({
    'string.empty': 'Status harus diisi'
  })
}).min(1);

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    schedule_name: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});

const querySchemaCustomer = Joi.object({
  schedule_business: Joi.string().guid({ version: "uuidv4" }).optional(),
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    schedule_queue: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});

const post_schedule = async (req, res) => {
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
      schedule_name_pasien,
      schedule_noHp_pasien,
      schedule_address,
      schedule_date,
      schedule_start_practice,
      schedule_practice,
      schedule_business,
      schedule_doctor,
    } = value;

    console.log("Received data:", value);

    const practiceSchedule = await tbl_practice_schedule.findOne({
      where: { practice_uuid: schedule_practice },
      include: [{
        model: tbl_service,
        as: 'service_practice_as',
        attributes: ['service_uuid', 'service_quota']
      }]
    });

    console.log("Practice Schedule:", practiceSchedule);

    if (!practiceSchedule) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada jadwal praktik untuk UUID Praktik ini',
        data: null
      });
    }

    const selectedDate = moment(schedule_date).tz('Asia/Jakarta');
    const practiceDate = moment(practiceSchedule.practice_date).tz('Asia/Jakarta').format('YYYY-MM-DD');
    const practiceStart = moment.tz(practiceSchedule.practice_start, 'HH:mm:ss', 'Asia/Jakarta');
    const practiceEnd = moment.tz(practiceSchedule.practice_end, 'HH:mm:ss', 'Asia/Jakarta');
    const selectedTime = moment.tz(schedule_start_practice, 'HH:mm:ss', 'Asia/Jakarta');

    console.log("Selected Date:", selectedDate.format('YYYY-MM-DD'));
    console.log("Practice Date:", practiceDate);
    console.log("Selected Time:", selectedTime.format('HH:mm:ss'));
    console.log("Practice Start:", practiceStart.format('HH:mm:ss'));
    console.log("Practice End:", practiceEnd.format('HH:mm:ss'));

    if (!(selectedDate.isSame(practiceDate, 'day') && selectedTime.isBetween(practiceStart, practiceEnd, null, '[)'))) {
      return res.status(400).json({
        success: false,
        message: 'Waktu yang dipilih tidak tersedia pada tanggal tersebut',
        data: null
      });
    }

    const serviceName = practiceSchedule.service_practice_as.service_uuid;
    const currentQueueCount = await tbl_scheduling.count({
      where: {
        schedule_date,
        schedule_practice,
        '$practice_schedule_as.service_practice_as.service_uuid$': serviceName,
      },
      include: [{
        model: tbl_practice_schedule,
        as: 'practice_schedule_as',
        include: [{
          model: tbl_service,
          as: 'service_practice_as',
          attributes: []
        }],
        attributes: []
      }]
    });

    if (currentQueueCount >= practiceSchedule.service_practice_as.service_quota) {
      return res.status(400).json({
        success: false,
        message: 'Kuota Antrian Telah Habis',
        data: null
      });
    }

    const schedule_queue = currentQueueCount + 1;

    const schedule_uuid = uuidv4();
    const schedule_create_at = Math.floor(Date.now() / 1000);

    const create_schedule = await tbl_scheduling.create({
      schedule_uuid,
      schedule_queue,
      schedule_name_pasien,
      schedule_noHp_pasien,
      schedule_address,
      schedule_date,
      schedule_start_practice,
      schedule_finish_practice: null,
      schedule_practice,
      schedule_business,
      schedule_doctor,
      schedule_create_at,
    });

    if (!create_schedule) {
      return res.status(400).json({
        success: false,
        message: 'Gagal membuat jadwal',
        data: null
      });
    }

    res.status(201).json({
      success: true,
      message: 'Jadwal berhasil dibuat',
      data: {
        schedule_uuid: create_schedule.schedule_uuid,
        schedule_queue: create_schedule.schedule_queue,
        schedule_name_pasien: create_schedule.schedule_name_pasien,
        schedule_noHp_pasien: create_schedule.schedule_noHp_pasien,
        schedule_address: create_schedule.schedule_address,
        schedule_date: create_schedule.schedule_date,
        schedule_start_practice: create_schedule.schedule_start_practice,
        schedule_finish_practice: create_schedule.schedule_finish_practice,
        schedule_practice: create_schedule.schedule_practice,
        schedule_business: create_schedule.schedule_business,
        schedule_doctor: create_schedule.schedule_doctor,
        schedule_create_at: moment.unix(create_schedule.schedule_create_at).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
      }
    });
  } catch (error) {
    console.log(error, 'Data Error');
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

const put_schedule = async (req, res) => {
  try {
    const { schedule_uuid } = req.params;

    if (!schedule_uuid) {
      return res.status(400).json({
        success: false,
        message: 'UUID tidak boleh kosong',
        data: null
      });
    }

    const { error, value } = putScheduleSchema.validate(req.body, { allowUnknown: true });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null
      });
    }

    const schedule = await tbl_scheduling.findOne({ where: { schedule_uuid } });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Data tidak ditemukan',
        data: null
      });
    }

    const { schedule_practice, schedule_business, schedule_doctor, ...otherUpdates } = value;

    const updateData = {
      ...otherUpdates,
      schedule_update_at: Math.floor(Date.now() / 1000),
    };

    if (value.schedule_status === 'Y') {
      updateData.schedule_finish_practice = moment().tz('Asia/Jakarta').format('HH:mm:ss');
    }

    await schedule.update(updateData);

    res.status(200).json({
      success: true,
      message: 'Data berhasil diperbarui',
      data: {
        schedule_uuid: schedule.schedule_uuid,
        schedule_queue: schedule.schedule_queue,
        schedule_name_pasien: schedule.schedule_name_pasien,
        schedule_noHp_pasien: schedule.schedule_noHp_pasien,
        schedule_status: schedule.schedule_status,
        schedule_date: schedule.schedule_date,
        schedule_start_practice: schedule.schedule_start_practice,
        schedule_finish_practice: schedule.schedule_finish_practice,
        schedule_address: schedule.schedule_address,
        schedule_practice: schedule.schedule_practice,
        schedule_business: schedule.schedule_business,
        schedule_doctor: schedule.schedule_doctor,
        schedule_create_at: moment.unix(schedule.schedule_create_at).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
        schedule_update_at: moment.unix(schedule.schedule_update_at).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
      }
    });
  } catch (error) {
    console.log(error, 'Data Error');
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
}

const delete_schedule = async (req, res) => {
  try {
    const { schedule_uuid } = req.params;

    if (!schedule_uuid) {
      return res.status(400).json({
        success: false,
        message: 'UUID tidak boleh kosong',
        data: null
      });
    }

    const schedule = await tbl_scheduling.findOne({ where: { schedule_uuid } });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Data tidak ditemukan',
        data: null
      });
    }

    await schedule.destroy();

    res.status(200).json({
      success: true,
      message: 'Data berhasil dihapus',
      data: null
    });
  } catch (error) {
    console.log(error, 'Data Error');
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

const get_detail_schedule = async (req, res) => {
  try {
    const { schedule_uuid } = req.params;

    if (!schedule_uuid) {
      return res.status(400).json({
        success: false,
        message: 'UUID tidak boleh kosong',
        data: null
      });
    }

    const schedule = await tbl_scheduling.findOne({
      where: { schedule_uuid },
      include: [
        {
          model: tbl_practice_schedule,
          as: "practice_schedule_as",
          attributes: [
            "practice_uuid",
            "doctor_name",
            "doctor_position",
            "practice_business",
            "practice_date",
            "practice_start",
            "practice_end",
          ],
          include: [
            {
              model: tbl_service,
              as: "service_practice_as",
              attributes: ["service_uuid", "service_name"],
            },
          ],
        },
        {
          model: tbl_business,
          as: "business_schedule_as",
          attributes: [
            "business_uuid",
            "business_name",
          ],
        },
        {
          model: tbl_teams,
          as: "team_schedule_as",
          attributes: [
            "team_uuid",
            "team_name",
          ],
        },
      ],
    });

    console.log('scheddd', schedule)

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Data tidak ditemukan',
        data: null
      });
    }

    const data = {
      schedule_name_pasien: schedule.schedule_name_pasien,
      schedule_noHp_pasien: schedule.schedule_noHp_pasien,
      schedule_status: schedule.schedule_status,
      schedule_date: schedule.schedule_date,
      schedule_start_practice: schedule.schedule_start_practice,
      schedule_finish_practice: schedule.schedule_finish_practice,
      schedule_address: schedule.schedule_address,
      schedule_queue: schedule.schedule_queue,
      schedule_practice: schedule.practice_schedule_as
        ? {
            practice_uuid: schedule.practice_schedule_as.practice_uuid,
            doctor_name: schedule.practice_schedule_as.doctor_name,
            doctor_position: schedule.practice_schedule_as.service_practice_as
            ? {
                service_uuid: schedule.practice_schedule_as.service_practice_as.service_uuid,
                service_name: schedule.practice_schedule_as.service_practice_as.service_name,
              }
            : null,
            practice_business: schedule.practice_schedule_as.practice_business,
            practice_date: schedule.practice_schedule_as.practice_date,
            practice_start: schedule.practice_schedule_as.practice_start,
            practice_end: schedule.practice_schedule_as.practice_end,
          }
        : null,
      schedule_business: schedule.business_schedule_as
        ? {
            business_uuid: schedule.business_schedule_as.business_uuid,
            business_name: schedule.business_schedule_as.business_name,
            business_desc: schedule.business_schedule_as.business_desc,
            business_province: schedule.business_schedule_as.business_province,
            business_regency: schedule.business_schedule_as.business_regency,
            business_subdistrict: schedule.business_schedule_as.business_subdistrict,
            business_address: schedule.business_schedule_as.business_address,
          }
        : null,
      schedule_doctor: schedule.team_schedule_as
        ? {
            team_uuid: schedule.team_schedule_as.team_uuid,
            team_name: schedule.team_schedule_as.team_name,
          }
        : null,
    };

    res.status(200).json({
      success: true,
      message: 'Data berhasil ditemukan',
      data: data
    });
  } catch (error) {
    console.log(error, 'Data Error');
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null
    });
  }
};

const get_all_schedule = async (req, res) => {
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
    } = value;

    const offset = limit && page ? (page - 1) * limit : 0;

    const whereClause = {
      schedule_delete_at: null,
    };

    if (filter.schedule_queue) {
      const filterNames = Array.isArray(filter.schedule_queue)
        ? filter.schedule_queue
        : filter.schedule_queue.split(",");

      if (filterNames.length > 0) {
        whereClause.schedule_queue = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.schedule_queue");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }

    if (keyword) {
      const keywordClause = {
        [Sequelize.Op.or]: [
          { schedule_name_pasien: { [Sequelize.Op.like]: `%${keyword}%` } },
          { '$practice_schedule_as.doctor_name$': { [Sequelize.Op.like]: `%${keyword}%` } },
        ],
      };

      whereClause[Sequelize.Op.and] = whereClause[Sequelize.Op.and]
        ? [...whereClause[Sequelize.Op.and], keywordClause]
        : [keywordClause];
    }

    const data = await tbl_scheduling.findAndCountAll({
      where: whereClause,
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
          model: tbl_practice_schedule,
          as: "practice_schedule_as",
          attributes: [
            "practice_uuid",
            "doctor_name",
            "doctor_position",
            "practice_business",
            "practice_date",
            "practice_start",
            "practice_end",
          ],
          include: [
            {
              model: tbl_service,
              as: "service_practice_as",
              attributes: ["service_uuid", "service_name", "service_quota"],
            },
          ],
        },
        {
          model: tbl_business,
          as: "business_schedule_as",
          attributes: [
            "business_uuid",
            "business_name",
          ],
        },
        {
          model: tbl_teams,
          as: "team_schedule_as",
          attributes: [
            "team_uuid",
            "team_name",
          ],
        },
      ],
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Data berhasil ditemukan",
      data: data.rows.map((schedule) => ({
        schedule_uuid: schedule.schedule_uuid,
        schedule_queue: schedule.schedule_queue,
        schedule_name_pasien: schedule.schedule_name_pasien,
        schedule_noHp_pasien: schedule.schedule_noHp_pasien,
        schedule_status: schedule.schedule_status,
        schedule_date: schedule.schedule_date,
        schedule_start_practice: schedule.schedule_start_practice,
        schedule_finish_practice: schedule.schedule_finish_practice,
        schedule_address: schedule.schedule_address,
        schedule_create_at: moment(schedule.schedule_create_at).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
        schedule_update_at: schedule.schedule_update_at ? moment(schedule.schedule_update_at).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss') : null,
        schedule_practice: schedule.practice_schedule_as
        ? {
            practice_uuid: schedule.practice_schedule_as.practice_uuid,
            doctor_name: schedule.practice_schedule_as.doctor_name,
            doctor_position: schedule.practice_schedule_as.service_practice_as // Accessing the correct alias
            ? {
                service_uuid: schedule.practice_schedule_as.service_practice_as.service_uuid,
                service_name: schedule.practice_schedule_as.service_practice_as.service_name,
              }
            : null,
            practice_business: schedule.practice_schedule_as.practice_business,
            practice_date: schedule.practice_schedule_as.practice_date,
            practice_start:
              schedule.practice_schedule_as.practice_start,
            practice_end: schedule.practice_schedule_as.practice_end,
          }
        : null,
        schedule_business: schedule.business_schedule_as
          ? {
              business_uuid: schedule.business_schedule_as.business_uuid,
              business_name: schedule.business_schedule_as.business_name,
            }
          : null,
        schedule_doctor: schedule.team_schedule_as
          ? {
              team_uuid: schedule.team_schedule_as.team_uuid,
              team_name: schedule.team_schedule_as.team_name,
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
    const excludePagesUrl = "http://localhost:9900/api/v1/schedule/get_all";

    if (currentUrl === excludePagesUrl) {
      delete result.pages;
    }

    res.status(200).json(result);
  } catch (error) {
    console.log(error, 'Data Error');
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null,
    });
  }
};

const get_schedule_customer = async (req, res) => {
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
      schedule_business = null,
      limit = null,
      page = null,
      keyword = "",
      filter = {},
    } = value;

    const offset = limit && page ? (page - 1) * limit : 0;

    const whereClause = {
      [Op.and]: [
        { schedule_delete_at: null },
        {
          [Op.or]: [
            {
              schedule_business: schedule_business
                ? schedule_business
                : { [Op.ne]: null },
            },
            { schedule_name_pasien: { [Op.like]: `%${keyword}%` } },
          ],
        },
        Sequelize.where(
          Sequelize.col("business_schedule_as.business_customer"),
          uuid
        ),
      ],
    };

    if (filter.schedule_queue) {
      const filterNames = Array.isArray(filter.schedule_queue)
        ? filter.schedule_queue
        : filter.schedule_queue.split(",");

      if (filterNames.length > 0) {
        whereClause.schedule_queue = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.schedule_queue");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }

    if (keyword) {
      const keywordClause = {
        [Sequelize.Op.or]: [
          { schedule_name_pasien: { [Sequelize.Op.like]: `%${keyword}%` } },
          { '$practice_schedule_as.doctor_name$': { [Sequelize.Op.like]: `%${keyword}%` } },
        ],
      };

      whereClause[Sequelize.Op.and] = whereClause[Sequelize.Op.and]
        ? [...whereClause[Sequelize.Op.and], keywordClause]
        : [keywordClause];
    }

    const data = await tbl_scheduling.findAndCountAll({
      where: whereClause,
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
          model: tbl_practice_schedule,
          as: "practice_schedule_as",
          attributes: [
            "practice_uuid",
            "doctor_name",
            "doctor_position",
            "practice_business",
            "practice_date",
            "practice_start",
            "practice_end",
          ],
          include: [
            {
              model: tbl_service,
              as: "service_practice_as",
              attributes: ["service_uuid", "service_name", "service_quota"],
            },
          ],
        },
        {
          model: tbl_business,
          as: "business_schedule_as",
          attributes: [
            "business_uuid",
            "business_name",
          ],
        },
        {
          model: tbl_teams,
          as: "team_schedule_as",
          attributes: [
            "team_uuid",
            "team_name",
          ],
        },
      ],
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Data berhasil ditemukan",
      data: data.rows.map((schedule) => ({
        schedule_uuid: schedule.schedule_uuid,
        schedule_queue: schedule.schedule_queue,
        schedule_name_pasien: schedule.schedule_name_pasien,
        schedule_noHp_pasien: schedule.schedule_noHp_pasien,
        schedule_status: schedule.schedule_status,
        schedule_date: schedule.schedule_date,
        schedule_start_practice: schedule.schedule_start_practice,
        schedule_finish_practice: schedule.schedule_finish_practice,
        schedule_address: schedule.schedule_address,
        schedule_create_at: moment(schedule.schedule_create_at).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss'),
        schedule_update_at: schedule.schedule_update_at ? moment(schedule.schedule_update_at).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss') : null,
        schedule_practice: schedule.practice_schedule_as
        ? {
            practice_uuid: schedule.practice_schedule_as.practice_uuid,
            doctor_name: schedule.practice_schedule_as.doctor_name,
            doctor_position: schedule.practice_schedule_as.service_practice_as // Accessing the correct alias
            ? {
                service_uuid: schedule.practice_schedule_as.service_practice_as.service_uuid,
                service_name: schedule.practice_schedule_as.service_practice_as.service_name,
              }
            : null,
            practice_business: schedule.practice_schedule_as.practice_business,
            practice_date: schedule.practice_schedule_as.practice_date,
            practice_start:
              schedule.practice_schedule_as.practice_start,
            practice_end: schedule.practice_schedule_as.practice_end,
          }
        : null,
        schedule_business: schedule.business_schedule_as
          ? {
              business_uuid: schedule.business_schedule_as.business_uuid,
              business_name: schedule.business_schedule_as.business_name,
            }
          : null,
        schedule_doctor: schedule.team_schedule_as
          ? {
              team_uuid: schedule.team_schedule_as.team_uuid,
              team_name: schedule.team_schedule_as.team_name,
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

const get_all_byBusiness = async (req, res) => {
  try {
    const { business_uuid } = req.params;
    const { schedule_name_pasien } = req.query;

    const antrian = await tbl_scheduling.findAll({
      where: {
        schedule_business: business_uuid,
        schedule_delete_at: null,
        ...(schedule_name_pasien && { schedule_name_pasien: schedule_name_pasien })
      },
      attributes: [
        'schedule_uuid', 'schedule_queue', 'schedule_name_pasien', 'schedule_noHp_pasien', 'schedule_status',
        'schedule_date', 'schedule_start_practice', 'schedule_finish_practice', 'schedule_address',
        'schedule_create_at', 'schedule_update_at'
      ],
      include: [
        {
          model: tbl_practice_schedule,
          as: "practice_schedule_as",
          attributes: [
            "practice_uuid",
            "doctor_name",
            "doctor_position",
            "practice_business",
            "practice_date",
            "practice_start",
            "practice_end",
          ],
          include: [
            {
              model: tbl_service,
              as: "service_practice_as",
              attributes: ["service_uuid", "service_name", "service_quota"],
            },
          ],
        },
        {
          model: tbl_business,
          as: "business_schedule_as",
          attributes: [
            "business_uuid",
            "business_name",
          ],
        },
        {
          model: tbl_teams,
          as: "team_schedule_as",
          attributes: [
            "team_uuid",
            "team_name",
          ],
        },
      ],
    });

    const formattedData = antrian.map(item => ({
      schedule_uuid: item.schedule_uuid,
      schedule_queue: item.schedule_queue,
      schedule_name_pasien: item.schedule_name_pasien,
      schedule_noHp_pasien: item.schedule_noHp_pasien,
      schedule_status: item.schedule_status,
      schedule_date: item.schedule_date,
      schedule_start_practice: item.schedule_start_practice,
      schedule_finish_practice: item.schedule_finish_practice,
      schedule_address: item.schedule_address,
      schedule_create_at: item.schedule_create_at,
      schedule_update_at: item.schedule_update_at,
      schedule_practice: item.practice_schedule_as ? {
        practice_uuid: item.practice_schedule_as.practice_uuid,
        doctor_name: item.practice_schedule_as.doctor_name,
        doctor_position: item.practice_schedule_as.service_practice_as ? {
          service_uuid: item.practice_schedule_as.service_practice_as.service_uuid,
          service_name: item.practice_schedule_as.service_practice_as.service_name
        } : null,
        practice_business: item.practice_schedule_as.practice_business,
        practice_date: item.practice_schedule_as.practice_date,
        practice_start: item.practice_schedule_as.practice_start,
        practice_end: item.practice_schedule_as.practice_end
      } : null,
      schedule_business: item.business_schedule_as ? {
        business_uuid: item.business_schedule_as.business_uuid,
        business_name: item.business_schedule_as.business_name
      } : null,
      schedule_doctor: item.team_schedule_as ? {
        team_uuid: item.team_schedule_as.team_uuid,
        team_name: item.team_schedule_as.team_name
      } : null
    }))
    .filter(item => item.schedule_status !== 'Y');

    res.status(200).json({
      success: true,
      message: 'Data berhasil ditemukan',
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

const get_all_byPractice = async (req, res) => {
  try {
    const { practice_uuid } = req.params;
    const { schedule_name_pasien } = req.query;

    const antrian = await tbl_scheduling.findAll({
      where: {
        schedule_practice: practice_uuid,
        schedule_delete_at: null,
        ...(schedule_name_pasien && { schedule_name_pasien })
      },
      attributes: [
        'schedule_uuid', 'schedule_queue', 'schedule_name_pasien', 'schedule_noHp_pasien', 'schedule_status',
        'schedule_date', 'schedule_start_practice', 'schedule_finish_practice', 'schedule_address',
        'schedule_create_at', 'schedule_update_at'
      ],
      include: [
        {
          model: tbl_practice_schedule,
          as: "practice_schedule_as",
          attributes: [
            "practice_uuid", "doctor_name", "doctor_position", "practice_business",
            "practice_date", "practice_start", "practice_end"
          ],
          include: [
            {
              model: tbl_service,
              as: "service_practice_as",
              attributes: ["service_uuid", "service_name", "service_quota"]
            }
          ]
        },
        {
          model: tbl_business,
          as: "business_schedule_as",
          attributes: ["business_uuid", "business_name"]
        },
        {
          model: tbl_teams,
          as: "team_schedule_as",
          attributes: ["team_uuid", "team_name"]
        }
      ]
    });

    const formattedData = antrian.map(item => ({
      schedule_uuid: item.schedule_uuid,
      schedule_queue: item.schedule_queue,
      schedule_name_pasien: item.schedule_name_pasien,
      schedule_noHp_pasien: item.schedule_noHp_pasien,
      schedule_status: item.schedule_status,
      schedule_date: item.schedule_date,
      schedule_start_practice: item.schedule_start_practice,
      schedule_finish_practice: item.schedule_finish_practice,
      schedule_address: item.schedule_address,
      schedule_create_at: item.schedule_create_at,
      schedule_update_at: item.schedule_update_at,
      schedule_practice: item.practice_schedule_as ? {
        practice_uuid: item.practice_schedule_as.practice_uuid,
        doctor_name: item.practice_schedule_as.doctor_name,
        doctor_position: item.practice_schedule_as.doctor_position,
        service: item.practice_schedule_as.service_practice_as ? {
          service_uuid: item.practice_schedule_as.service_practice_as.service_uuid,
          service_name: item.practice_schedule_as.service_practice_as.service_name
        } : null,
        practice_business: item.practice_schedule_as.practice_business,
        practice_date: item.practice_schedule_as.practice_date,
        practice_start: item.practice_schedule_as.practice_start,
        practice_end: item.practice_schedule_as.practice_end
      } : null,
      schedule_business: item.business_schedule_as ? {
        business_uuid: item.business_schedule_as.business_uuid,
        business_name: item.business_schedule_as.business_name
      } : null,
      schedule_doctor: item.team_schedule_as ? {
        team_uuid: item.team_schedule_as.team_uuid,
        team_name: item.team_schedule_as.team_name
      } : null
    })).filter(item => item.schedule_status !== 'Y');

    res.status(200).json({
      success: true,
      message: 'Data berhasil ditemukan',
      data: formattedData
    });
  } catch (error) {
    console.error('Kesalahan Data:', error);
    res.status(500).json({
      success: false,
      message: 'Kesalahan server internal',
      data: null
    });
  }
};



module.exports = {
  post_schedule,
  put_schedule,
  delete_schedule,
  get_all_schedule,
  get_all_byBusiness,
  get_all_byPractice,
  get_schedule_customer,
  get_detail_schedule,
};
