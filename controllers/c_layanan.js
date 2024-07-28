const { v4: uuidv4 } = require("uuid");
const db = require("../models");
const tbl_service = db.tbl_service;
const tbl_customer = db.tbl_customer;
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    service_name: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});

const querySchemaCustomer = Joi.object({
  service_business: Joi.string().guid({ version: "uuidv4" }).optional(),
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    service_name: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});

const post_layanan = async (req, res) => {
  try {
    const { service_name, service_business, service_quota } = req.body;

    const service_uuid = uuidv4();

    const newLayanan = await tbl_service.create({
      service_uuid,
      service_name,
      service_business,
      service_quota,
    });

    res.status(200).json(newLayanan);
  } catch (error) {
    res.status(500).json({ message: "Error creating layanan", error });
  }
};

const put_layanan = async (req, res) => {
  try {
    const { service_uuid } = req.params;
    const { service_name, service_business, service_quota } = req.body;

    const layanan = await tbl_service.findOne({
      where: { service_uuid },
    });

    if (!layanan) {
      return res.status(404).json({
        success: false,
        message: "Layanan tidak ditemukan",
      });
    }

    await layanan.update({
      service_name,
      service_business,
      service_quota,
      service_update_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Layanan berhasil diperbarui",
      data: layanan,
    });
  } catch (error) {
    console.error("Error updating layanan:", error);
    res.status(500).json({
      success: false,
      message: "Error updating layanan",
      error,
    });
  }
};

const delete_layanan = async (req, res) => {
  try {
    const { service_uuid } = req.params;

    const delete_service = await tbl_service.findOne({
      where: { service_uuid },
    });

    if (!delete_service) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data: Data tidak ditemukan",
        data: null,
      });
    }

    await delete_service.update({ service_delete_at: new Date() });

    res.json({
      success: true,
      message: "Sukses menghapus data",
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

const get_detail_layanan_business = async (req, res) => {
  try {
    const { business_uuid } = req.params;

    const layananList = await tbl_service.findAll({
      where: { service_business: business_uuid, service_delete_at: null },
      include: [
        {
          model: db.tbl_business,
          as: "service_business_as",
          attributes: ["business_uuid", "business_name"],
        },
      ],
    });

    res.status(200).json(layananList);
  } catch (error) {
    res.status(500).json({ message: "Error fetching layanan", error });
  }
};

const get_detail_layanan = async (req, res) => {
  try {
    const { service_uuid } = req.params;

    // Fetch all layanan associated with the service_uuid
    const layananDetail = await tbl_service.findOne({
      where: { service_uuid, service_delete_at: null },
      include: [
        {
          model: db.tbl_business,
          as: "service_business_as",
          attributes: ["business_uuid", "business_name"], // Assuming tbl_business has these fields
        },
      ],
    });

    if (!layananDetail) {
      return res.status(404).json({
        success: false,
        message: "Gagal Mendapatkan Data",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil Mendapatkan Data",
      data: {
        service_uuid: layananDetail.service_uuid,
        service_name: layananDetail.service_name,
        service_quota: layananDetail.service_quota,
        service_business: layananDetail.service_business_as
          ? {
              business_uuid: layananDetail.service_business_as.business_uuid,
              business_name: layananDetail.service_business_as.business_name,
            }
          : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching layanan", error });
  }
};

const get_all_layanan = async (req, res) => {
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
      order = { service_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      service_delete_at: null,
    };

    if (filter.service_name) {
      const filterNames = Array.isArray(filter.service_name)
        ? filter.service_name
        : filter.service_name.split(",");

      if (filterNames.length > 0) {
        whereClause.service_name = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.service_name");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }
    if (keyword) {
      const keywordClause = {
        [Sequelize.Op.or]: [
          { service_name: { [Sequelize.Op.like]: `%${keyword}%` } },
          {
            "$service_business_as.business_name$": {
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

    const data = await tbl_service.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
          model: db.tbl_business,
          as: "service_business_as",
          attributes: ["business_uuid", "business_name"],
        },
      ],
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((layanan) => ({
        service_uuid: layanan.service_uuid,
        service_name: layanan.service_name,
        service_quota: layanan.service_quota,
        service_business: layanan.service_business_as
          ? {
              business_uuid: layanan.service_business_as.business_uuid,
              business_name: layanan.service_business_as.business_name,
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
    res.status(500).json({ message: "Error fetching all layanan", error });
  }
};

const get_layanan_customer = async (req, res) => {
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
      service_business = null,
      limit = null,
      page = null,
      keyword = "",
      filter = {},
      order = { service_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      [Op.and]: [
        { service_delete_at: null },
        {
          [Op.or]: [
            {
              service_business: service_business
                ? service_business
                : { [Op.ne]: null },
            },
            { service_name: { [Op.like]: `%${keyword}%` } },
          ],
        },
        Sequelize.where(
          Sequelize.col("service_business_as.business_customer"),
          uuid
        ),
      ],
    };

    if (filter.service_name) {
      const filterNames = Array.isArray(filter.service_name)
        ? filter.service_name
        : filter.service_name.split(",");

      if (filterNames.length > 0) {
        whereClause[Op.and].push({
          service_name: {
            [Op.or]: filterNames.map((name) => ({
              [Op.like]: `%${name.trim()}%`,
            })),
          },
        });
      } else {
        console.log("Empty filter.service_name");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }

    if (keyword) {
      const keywordClause = {
        [Sequelize.Op.or]: [
          { service_name: { [Sequelize.Op.like]: `%${keyword}%` } },
          {
            "$service_business_as.business_name$": {
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

    const data = await tbl_service.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
          model: db.tbl_business,
          as: "service_business_as",
          attributes: ["business_uuid", "business_name"],
          where: {
            business_customer: uuid,
          },
        },
      ],
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((layanan) => ({
        service_uuid: layanan.service_uuid,
        service_name: layanan.service_name,
        service_quota: layanan.service_quota,
        service_business: layanan.service_business_as
          ? {
              business_uuid: layanan.service_business_as.business_uuid,
              business_name: layanan.service_business_as.business_name,
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
};

module.exports = {
  get_layanan_customer,
  post_layanan,
  put_layanan,
  delete_layanan,
  get_detail_layanan,
  get_detail_layanan_business,
  get_all_layanan,
};
