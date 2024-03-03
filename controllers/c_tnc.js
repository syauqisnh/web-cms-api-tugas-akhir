const db = require("../models");
const tbl_tnc = db.tbl_tnc;
const tbl_business = db.tbl_business;
const tbl_price_list = db.tbl_price_list;
const tbl_customer = db.tbl_customer;
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");

const priceSchema = Joi.object({
  tnc_uuid_table: Joi.string().required().messages({
    'string.empty': 'Harga tidak boleh kosong',
  }),
  tnc_name: Joi.string().required().messages({
    'string.empty': 'Name tidak boleh kosong',
  }),
});

const priceSchemaUpdate = Joi.object({
  tnc_uuid_table: Joi.string().required().messages({
    'string.empty': 'Harga tidak boleh kosong',
  }),
  tnc_name: Joi.string().required().messages({
    'string.empty': 'Name tidak boleh kosong',
  }),
});

const uuidSchema = Joi.object({
  tnc_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    tnc_name: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});

const querySchemaUniqe = Joi.object({
  field: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9,_]+$")),
});

const querySchemaCount = Joi.object({
  field: Joi.object()
    .pattern(
      Joi.string(),
      Joi.alternatives().try(
        Joi.string().trim(),
        Joi.array().items(Joi.string().trim())
      )
    )
    .required(),
});

const querySchemaByPrice = Joi.object({
  tnc_business: Joi.string().guid({ version: "uuidv4" }).optional(),
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    tnc_name: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});

const post_tnc = async (req, res) => {
  try {
    const { error, value } = priceSchema.validate(req.body); // Menggunakan priceSchema bukan scopeSchema
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { tnc_uuid_table, tnc_name } = value;

    const priceValid = await tbl_price_list.findOne({
      where: { price_list_uuid: tnc_uuid_table },
    });

    if (!priceValid) {
      return res.status(400).json({
        success: false,
        message: "Data tidak ditemukan",
        data: null,
      });
    }

    const existingTnc = await tbl_tnc.findOne({
      where: { tnc_uuid_table: tnc_uuid_table, tnc_delete_at: null },
    });

    if (existingTnc) {
      return res.status(400).json({
        success: false,
        message: "Data sudah digunakan",
        data: null,
      });
    }

    const tnc_uuid = uuidv4();
    const create_tnc = await tbl_tnc.create({
      tnc_uuid: tnc_uuid,
      tnc_uuid_table: tnc_uuid_table,
      tnc_name: tnc_name,
      tnc_business: priceValid.price_list_business, 
    });

    if (!create_tnc) {
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
        tnc_uuid: create_tnc.tnc_uuid,
        tnc_uuid_table: create_tnc.tnc_uuid_table,
        tnc_name: create_tnc.tnc_name,
        tnc_business: create_tnc.tnc_business,
      },
    });
  } catch (error) {
    console.error("Error di post_scope:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      data: null,
    });
  }
};

const put_tnc = async (req, res) => {
  try {
    const tnc_uuid = req.params.tnc_uuid;
    const { error, value } = priceSchemaUpdate.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const update_tnc = await tbl_tnc.findOne({
      where: { tnc_uuid },
    });

    if (!update_tnc) {
      return res.status(404).json({
        success: false,
        message: "Gagal merubah data",
        data: null,
      });
    }

    if (value.tnc_uuid_table && value.tnc_uuid_table !== update_tnc.tnc_uuid_table) {
      // Periksa keberadaan data yang sama dengan tnc_uuid_table baru
      const existingPrice = await tbl_tnc.findOne({
        where: {
          tnc_uuid_table: value.tnc_uuid_table,
          tnc_uuid: { [Op.ne]: tnc_uuid },
          tnc_delete_at: null,
        },
      });

      if (existingPrice) {
        return res.status(400).json({
          success: false,
          message: "Data Sudah di Gunakan",
          data: null,
        });
      }

      // Jika tnc_uuid_table diubah, perbarui tnc_business berdasarkan nilai baru
      const priceValid = await tbl_price_list.findOne({
        where: { price_list_uuid: value.tnc_uuid_table },
      });

      if (!priceValid) {
        return res.status(400).json({
          success: false,
          message: "Data tidak ditemukan",
          data: null,
        });
      }

      await update_tnc.update({
        tnc_name: value.tnc_name || update_tnc.tnc_name,
        tnc_uuid_table: value.tnc_uuid_table || update_tnc.tnc_uuid_table,
        tnc_business: priceValid.price_list_business,
        tnc_update_at: new Date(),
      });
    } else {
      await update_tnc.update({
        tnc_name: value.tnc_name || update_tnc.tnc_name,
        tnc_uuid_table: value.tnc_uuid_table || update_tnc.tnc_uuid_table,
        tnc_update_at: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        tnc_uuid: update_tnc.tnc_uuid,
        tnc_uuid_table: update_tnc.tnc_uuid_table,
        tnc_name: update_tnc.tnc_name,
        tnc_business: update_tnc.tnc_business,
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

const delete_tnc = async (req, res) => {
  const { error, value } = uuidSchema.validate(req.params);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
      data: null,
    });
  }

  const { tnc_uuid } = value;

  const delete_tnc = await tbl_tnc.findOne({
    where: {
      tnc_uuid,
    },
  });

  if (!delete_tnc) {
    return res.status(404).json({
      success: false,
      message: "Gagal menghapus data",
      data: null,
    });
  }

  await delete_tnc.update({ tnc_delete_at: new Date() });

  res.status(200).json({
    success: true,
    message: "Sukses menghapus data",
  });
};

const get_detail_tnc = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { tnc_uuid } = value;

    const detail_tnc = await tbl_tnc.findOne({
      where: {
        tnc_uuid,
        tnc_delete_at: null,
      },
      include: [
        {
          model: tbl_price_list,
          as: "tnc_price_as",
          attributes: [
            "price_list_uuid",
            "price_list_name",
            "price_list_price",
            "price_list_desc",
            "price_list_status",
            "price_list_order",
            "price_list_business",
          ],
        },
        {
          model: tbl_business,
          as: "tnc_business_as",
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

    if (!detail_tnc) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan",
        data: null,
      });
    }

    const result = {
      success: true,
      message: "Data berhasil ditemukan",
      data: {
        tnc_uuid: detail_tnc.tnc_uuid,
        tnc_uuid_table: detail_tnc.tnc_price_as
          ? {
              price_list_uuid: detail_tnc.tnc_price_as.price_list_uuid,
              price_list_name: detail_tnc.tnc_price_as.price_list_name,
              price_list_price: detail_tnc.tnc_price_as.price_list_price,
              price_list_desc: detail_tnc.tnc_price_as.price_list_desc,
              price_list_status: detail_tnc.tnc_price_as.price_list_status,
              price_list_order: detail_tnc.tnc_price_as.price_list_order,
              price_list_business: detail_tnc.tnc_price_as.price_list_business,
            }
          : null,
        tnc_name: detail_tnc.tnc_name,
        tnc_business: detail_tnc.tnc_business_as
          ? {
              business_uuid: detail_tnc.tnc_business_as.business_uuid,
              business_name: detail_tnc.tnc_business_as.business_name,
              business_desc: detail_tnc.tnc_business_as.business_desc,
              business_province: detail_tnc.tnc_business_as.business_province,
              business_regency: detail_tnc.tnc_business_as.business_regency,
              business_subdistrict:
                detail_tnc.tnc_business_as.business_subdistrict,
              business_address: detail_tnc.tnc_business_as.business_address,
              business_customer: detail_tnc.tnc_business_as.business_customer,
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

const get_all_tnc = async (req, res) => {
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
      order = { tnc_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      tnc_delete_at: null,
    };

    if (filter.tnc_name) {
      const filterNames = Array.isArray(filter.tnc_name)
        ? filter.tnc_name
        : filter.tnc_name.split(",");

      if (filterNames.length > 0) {
        whereClause.tnc_name = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.tnc_name");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }
    if (keyword) {
      const keywordClause = {
        [Sequelize.Op.like]: `%${keyword}%`,
      };
      offset = 0;

      whereClause.tnc_name = whereClause.tnc_name
        ? { [Sequelize.Op.and]: [whereClause.tnc_name, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_tnc.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
          model: tbl_price_list,
          as: "tnc_price_as",
          attributes: [
            "price_list_uuid",
            "price_list_name",
            "price_list_price",
            "price_list_desc",
            "price_list_status",
            "price_list_order",
            "price_list_business",
          ],
        },
        {
          model: tbl_business,
          as: "tnc_business_as",
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
      data: data.rows.map((tnc) => ({
        tnc_uuid: tnc.tnc_uuid,
        tnc_uuid_table: tnc.tnc_price_as
          ? {
              price_list_uuid: tnc.tnc_price_as.price_list_uuid,
              price_list_name: tnc.tnc_price_as.price_list_name,
              price_list_price: tnc.tnc_price_as.price_list_price,
              price_list_desc: tnc.tnc_price_as.price_list_desc,
              price_list_status: tnc.tnc_price_as.price_list_status,
              price_list_order: tnc.tnc_price_as.price_list_order,
              price_list_business: tnc.tnc_price_as.price_list_business,
            }
          : null,
        tnc_name: tnc.tnc_name,
        tnc_business: tnc.tnc_business_as
          ? {
              business_uuid: tnc.tnc_business_as.business_uuid,
              business_name: tnc.tnc_business_as.business_name,
              business_desc: tnc.tnc_business_as.business_desc,
              business_province: tnc.tnc_business_as.business_province,
              business_regency: tnc.tnc_business_as.business_regency,
              business_subdistrict: tnc.tnc_business_as.business_subdistrict,
              business_address: tnc.tnc_business_as.business_address,
              business_customer: tnc.tnc_business_as.business_customer,
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
    const excludePagesUrl = "http://localhost:9900/api/v1/tnc/get_all";

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

const get_uniqe_tnc = async (req, res) => {
  try {
    const { error, value } = querySchemaUniqe.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { field } = value;
    const fieldsArray = field.split(",");
    const tableAttributes = tbl_tnc.rawAttributes;
    const invalidFields = fieldsArray.filter((f) => !(f in tableAttributes));

    if (invalidFields.length > 0) {
      return res.status(200).json({
        success: false,
        message: "Gagal mendapatkan data",
        data: null,
      });
    }

    const uniqeValues = {};

    for (const f of fieldsArray) {
      const values = await tbl_tnc.findAll({
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(f)), f]],
        where: {
          tnc_delete_at: null,
        },
      });

      if (values && values.length > 0) {
        uniqeValues[f] = values.map((item) => item[f]);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Sukses mendapatkan data",
      data: uniqeValues,
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

const get_count_tnc = async (req, res) => {
  try {
    const { error, value } = querySchemaCount.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { field } = value;

    const counts = {};

    for (const fieldName in field) {
      if (field.hasOwnProperty(fieldName)) {
        const values = Array.isArray(field[fieldName])
          ? field[fieldName]
          : field[fieldName].split(",").map((val) => val.trim());

        const valueCounts = {};

        for (const value of values) {
          const count = await tbl_tnc.count({
            where: {
              [fieldName]: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.eq]: value,
              },
              tnc_delete_at: null,
            },
          });
          valueCounts[value] = count;
        }

        counts[fieldName] = Object.keys(valueCounts).map((value) => ({
          value,
          count: valueCounts[value],
        }));
      }
    }

    const response = {
      success: true,
      message: "Sukses mendapatkan data",
      data: counts,
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

const get_tnc_byPriceList = async (req, res) => {
  try {
    const { error, value } = querySchemaByPrice.validate(req.query);
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
      tnc_business = null,
      limit = null,
      page = null,
      keyword = "",
      filter = {},
      order = { tnc_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      [Op.and]: [
        { tnc_delete_at: null },
        {
          [Op.or]: [
            {
              tnc_business: tnc_business
                ? tnc_business
                : { [Op.ne]: null },
            },
            { tnc_name: { [Op.like]: `%${keyword}%` } },
          ],
        },
        Sequelize.where(
          Sequelize.col("tnc_business_as.business_customer"),
          uuid
        ),
      ],
    };

    if (filter.tnc_name) {
      const filterNames = Array.isArray(filter.tnc_name)
        ? filter.tnc_name
        : filter.tnc_name.split(",");

      if (filterNames.length > 0) {
        whereClause[Op.and].push({
          tnc_name: {
            [Op.or]: filterNames.map((name) => ({
              [Op.like]: `%${name.trim()}%`,
            })),
          },
        });
      } else {
        console.log("Empty filter.tnc_name");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }
    if (keyword) {
      const keywordClause = {
        [Sequelize.Op.like]: `%${keyword}%`,
      };
      offset = 0;

      whereClause.tnc_name = whereClause.tnc_name
        ? { [Sequelize.Op.and]: [whereClause.tnc_name, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_tnc.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
          model: tbl_price_list,
          as: "tnc_price_as",
          attributes: [
            "price_list_uuid",
            "price_list_name",
            "price_list_price",
            "price_list_desc",
            "price_list_status",
            "price_list_order",
            "price_list_business",
          ],
        },
        {
          model: tbl_business,
          as: "tnc_business_as",
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
      data: data.rows.map((tnc) => ({
        tnc_uuid: tnc.tnc_uuid,
        tnc_uuid_table: tnc.tnc_price_as
          ? {
              price_list_uuid: tnc.tnc_price_as.price_list_uuid,
              price_list_name: tnc.tnc_price_as.price_list_name,
              price_list_price: tnc.tnc_price_as.price_list_price,
              price_list_desc: tnc.tnc_price_as.price_list_desc,
              price_list_status: tnc.tnc_price_as.price_list_status,
              price_list_order: tnc.tnc_price_as.price_list_order,
              price_list_business: tnc.tnc_price_as.price_list_business,
            }
          : null,
        tnc_name: tnc.tnc_name,
        tnc_business: tnc.tnc_business_as
          ? {
              business_uuid: tnc.tnc_business_as.business_uuid,
              business_name: tnc.tnc_business_as.business_name,
              business_desc: tnc.tnc_business_as.business_desc,
              business_province: tnc.tnc_business_as.business_province,
              business_regency: tnc.tnc_business_as.business_regency,
              business_subdistrict: tnc.tnc_business_as.business_subdistrict,
              business_address: tnc.tnc_business_as.business_address,
              business_customer: tnc.tnc_business_as.business_customer,
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
    const excludePagesUrl = "http://localhost:9900/api/v1/tnc/get_all";

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

module.exports = {
  post_tnc,
  put_tnc,
  delete_tnc,
  get_all_tnc,
  get_detail_tnc,
  get_uniqe_tnc,
  get_count_tnc,
  get_tnc_byPriceList,
};
