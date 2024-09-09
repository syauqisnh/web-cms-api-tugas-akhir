const db = require("../models");
const tbl_price_list = db.tbl_price_list;
const tbl_business = db.tbl_business;
const tbl_media = db.tbl_media;
const tbl_customer = db.tbl_customer;
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const fs = require("fs")

const priceSchema = Joi.object({
  price_list_name: Joi.string().required().messages({
    'string.empty': 'Name tidak boleh kosong',
  }),
  price_list_price: Joi.number().required().messages({
    'number.base': 'Harga tidak boleh kosong',
  }),
  price_list_desc: Joi.string().required().messages({
    'string.empty': 'Deskripsi tidak boleh kosong',
  }),
  price_list_status: Joi.string().valid("Y", "N").default("N").required().messages({
    'string.empty': 'Status tidak boleh kosong',
  }),
  price_list_order: Joi.string().required().messages({
    'string.empty': 'Urutan tidak boleh kosong',
  }),
  price_list_business: Joi.string().required().messages({
    'string.base': 'Bisnis tidak boleh kosong',
  }),
});

const priceSchemaUpdate = Joi.object({
  price_list_name: Joi.string().required().messages({
    'string.empty': 'Name tidak boleh kosong',
  }),
  price_list_price: Joi.number().required().messages({
    'number.base': 'Harga tidak boleh kosong',
  }),
  price_list_desc: Joi.string().required().messages({
    'string.empty': 'Deskripsi tidak boleh kosong',
  }),
  price_list_status: Joi.string().valid("Y", "N").default("N").required().messages({
    'string.empty': 'Status tidak boleh kosong',
  }),
  price_list_order: Joi.string().required().messages({
    'string.empty': 'Urutan tidak boleh kosong',
  }),
  price_list_business: Joi.string().required().messages({
    'string.base': 'Bisnis tidak boleh kosong',
  }),
});

const uuidSchema = Joi.object({
  price_list_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    price_list_name: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
    price_list_price: Joi.object({
      min: Joi.number().optional(),
      max: Joi.number().optional(),
    }).optional(),
    price_list_status: Joi.string().valid("N", "Y").optional(),
    price_list_business: Joi.string().optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});
const querySchemaByBusiness = Joi.object({
  price_list_business: Joi.string().guid({ version: "uuidv4" }).optional(),
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    price_list_name: Joi.alternatives()
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

const post_price_list = async (req, res) => {
  try {
    const { error, value } = priceSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const {
      price_list_name,
      price_list_price,
      price_list_desc,
      price_list_status,
      price_list_order,
      price_list_business,
    } = value;

    const businessValid = await tbl_business.findOne({
      where: {
        business_uuid: price_list_business,
      },
    });

    if (!businessValid) {
      return res.status(400).json({
        success: false,
        message: "Data tidak ditemukan",
        data: null,
      });
    }

    const price_list_uuid = uuidv4();

    const create_price_list = await tbl_price_list.create({
      price_list_uuid: price_list_uuid,
      price_list_name: price_list_name,
      price_list_price: price_list_price,
      price_list_desc: price_list_desc,
      price_list_status: price_list_status,
      price_list_order: price_list_order,
      price_list_business: price_list_business,
    });

    if (!create_price_list) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data",
        data: null,
      });
    }

    const update_media = await tbl_media.findOne({
      where: {
        media_uuid: price_list_uuid,
      },
    });

    if (update_media) {
      await update_media.update({
        media_uuid_table: price_list_uuid || update_media.media_uuid_table,
        media_table: "price_list" || update_media.media_table,
        price_list_update_at: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil menambahkan data",
      data: {
        price_list_uuid: create_price_list.price_list_uuid,
        price_list_name: create_price_list.price_list_name,
        price_list_price: create_price_list.price_list_price,
        price_list_desc: create_price_list.price_list_desc,
        price_list_status: create_price_list.price_list_status,
        price_list_order: create_price_list.price_list_order,
        price_list_business: create_price_list.price_list_business,
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

const put_price_list = async (req, res) => {
  try {
    const price_list_uuid = req.params.price_list_uuid;
    const { error, value } = priceSchemaUpdate.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const update_price_list = await tbl_price_list.findOne({
      where: { price_list_uuid },
    });

    if (!update_price_list) {
      return res.status(404).json({
        success: false,
        message: "Gagal merubah data",
        data: null,
      });
    }

    if (
      value.price_list_business &&
      value.price_list_business !== update_price_list.price_list_business
    ) {
      const existingPrice = await tbl_price_list.findOne({
        where: {
          price_list_business: value.price_list_business,
          price_list_uuid: { [Op.ne]: price_list_uuid },
          price_list_delete_at: null,
        },
      });

      if (existingPrice) {
        return res.status(400).json({
          success: false,
          message: "Data Sudah di Gunakan",
          data: null,
        });
      }
    }

    await update_price_list.update({
      price_list_name:
        value.price_list_name || update_price_list.price_list_name,
      price_list_price:
        value.price_list_price || update_price_list.price_list_price,
      price_list_desc:
        value.price_list_desc || update_price_list.price_list_desc,
      price_list_status:
        value.price_list_status || update_price_list.price_list_status,
      price_list_order:
        value.price_list_order || update_price_list.price_list_order,
      price_list_business:
        value.price_list_business || update_price_list.price_list_business,
      price_list_update_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        price_list_uuid: update_price_list.price_list_uuid,
        price_list_name: update_price_list.price_list_name,
        price_list_price: update_price_list.price_list_price,
        price_list_desc: update_price_list.price_list_desc,
        price_list_status: update_price_list.price_list_status,
        price_list_order: update_price_list.price_list_order,
        price_list_business: update_price_list.price_list_business,
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

const delete_price_list = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { price_list_uuid } = value;

    const delete_price_list = await tbl_price_list.findOne({
      where: { price_list_uuid },
    });

    if (!delete_price_list) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data",
        data: null,
      });
    }

    const deleteMedia = await tbl_media.findAll({
      where: {
        media_uuid_table: price_list_uuid,
        media_table: 'price_list'
      }
    })

    for (const media of deleteMedia) {
      const filePath = `./uploads/${media.media_category}/${media.media_hash_name}`;
      fs.unlink(filePath, (error) => {
        if (error) {
          console.error('File gagal di hapus:', error)
        } else {
          console.log('Sukses menghapus file')
        }
      })
    }

    await tbl_media.update(
      {
        media_delete_at: new Date()
      },
      {
        where: {
          media_uuid_table: price_list_uuid,
          media_table: 'price_list'
        }
      }
    )

    await delete_price_list.update({ price_list_delete_at: new Date() });

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

const get_detail_price_list = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { price_list_uuid } = value;

    const detail_price_list = await tbl_price_list.findOne({
      where: {
        price_list_uuid,
        price_list_delete_at: null,
      },
      include: [
        {
          model: tbl_business,
          as: "price_business_as",
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
      ],
    });

    if (!detail_price_list) {
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
        price_list_uuid: detail_price_list.price_list_uuid,
        price_list_name: detail_price_list.price_list_name,
        price_list_price: detail_price_list.price_list_price,
        price_list_desc: detail_price_list.price_list_desc,
        price_list_status: detail_price_list.price_list_status,
        price_list_order: detail_price_list.price_list_order,
        price_list_business: detail_price_list.price_business_as
          ? {
              business_uuid: detail_price_list.price_business_as.business_uuid,
              business_name: detail_price_list.price_business_as.business_name,
              business_desc: detail_price_list.price_business_as.business_desc,
              business_province:
                detail_price_list.price_business_as.business_province,
              business_regency:
                detail_price_list.price_business_as.business_regency,
              business_subdistrict:
                detail_price_list.price_business_as.business_subdistrict,
              business_address:
                detail_price_list.price_business_as.business_address,
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

const get_all_price_list = async (req, res) => {
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
      order = { price_list_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      price_list_delete_at: null,
    };

    if (filter.price_list_name) {
      const filterNames = Array.isArray(filter.price_list_name)
        ? filter.price_list_name
        : filter.price_list_name.split(",");

      if (filterNames.length > 0) {
        whereClause.price_list_name = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.price_list_name");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }
    // Filter based on price_list_price
    if (filter.price_list_price && (filter.price_list_price.min || filter.price_list_price.max)) {
      whereClause.price_list_price = {};
      if (filter.price_list_price.min) {
        whereClause.price_list_price[Sequelize.Op.gte] = filter.price_list_price.min;
      }
      if (filter.price_list_price.max) {
        whereClause.price_list_price[Sequelize.Op.lte] = filter.price_list_price.max;
      }
    }
    
    // Filter based on price_list_status
    if (filter.price_list_status) {
      whereClause.price_list_status = filter.price_list_status;
    }

    if (filter.price_list_business) {
      whereClause['$price_business_as.business_name$'] = {
        [Sequelize.Op.like]: `%${filter.price_list_business.trim()}%`,
      };
    }

    if (keyword) {
      const keywordClause = {
        [Sequelize.Op.like]: `%${keyword}%`,
      };
      offset = 0;

      whereClause.price_list_name = whereClause.price_list_name
        ? { [Sequelize.Op.and]: [whereClause.price_list_name, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_price_list.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
          model: tbl_business,
          as: "price_business_as",
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
        {
          model: tbl_media,
          as: "price_media_as",
          attributes: ["media_uuid", "media_name", "media_hash_name",  "media_url"],
        },
      ],
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((price) => ({
        price_list_uuid: price.price_list_uuid,
        price_list_name: price.price_list_name,
        price_list_price: price.price_list_price,
        price_list_desc: price.price_list_desc,
        price_list_status: price.price_list_status,
        price_list_order: price.price_list_order,
        price_list_business: price.price_business_as
          ? {
              business_uuid: price.price_business_as.business_uuid,
              business_name: price.price_business_as.business_name,
              business_desc: price.price_business_as.business_desc,
              business_province: price.price_business_as.business_province,
              business_regency: price.price_business_as.business_regency,
              business_subdistrict:
                price.price_business_as.business_subdistrict,
              business_address: price.price_business_as.business_address,
            }
          : null,
        price_list_media: price.price_media_as
          ? {
              media_uuid: price.price_media_as.media_uuid,
              media_name: price.price_media_as.media_name,
              media_hash_name: price.price_media_as.media_hash_name,
              media_url: price.price_media_as.media_url,
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
    const excludePagesUrl = "http://localhost:9900/api/v1/price_list/get_all";

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

const get_uniqe_price_list = async (req, res) => {
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
    const tableAttributes = tbl_price_list.rawAttributes;
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
      const values = await tbl_price_list.findAll({
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(f)), f]],
        where: {
          price_list_delete_at: null,
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

const get_count_price_list = async (req, res) => {
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
          const count = await tbl_price_list.count({
            where: {
              [fieldName]: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.eq]: value,
              },
              price_list_delete_at: null,
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

const get_price_byBusiness = async (req, res) => {
  try {
    const { error, value } = querySchemaByBusiness.validate(req.query);
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
      price_list_business = null,
      limit = null,
      page = null,
      keyword = "",
      filter = {},
      order = { price_list_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      [Op.and]: [
        { price_list_delete_at: null },
        {
          [Op.or]: [
            {
              price_list_business: price_list_business
                ? price_list_business
                : { [Op.ne]: null },
            },
            { price_list_name: { [Op.like]: `%${keyword}%` } },
          ],
        },
        Sequelize.where(
          Sequelize.col("price_business_as.business_customer"),
          uuid
        ),
      ],
    };

    if (filter.price_list_name) {
      const filterNames = Array.isArray(filter.price_list_name)
        ? filter.price_list_name
        : filter.price_list_name.split(",");

      if (filterNames.length > 0) {
        whereClause[Op.and].push({
          price_list_name: {
            [Op.or]: filterNames.map((name) => ({
              [Op.like]: `%${name.trim()}%`,
            })),
          },
        });
      } else {
        console.log("Empty filter.price_list_name");
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

      whereClause.price_list_name = whereClause.price_list_name
        ? { [Sequelize.Op.and]: [whereClause.price_list_name, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_price_list.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
          model: tbl_business,
          as: "price_business_as",
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
        {
          model: tbl_media,
          as: "price_media_as",
          attributes: ["media_uuid", "media_name", "media_hash_name",  "media_url"],
        },
      ],
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((price) => ({
        price_list_uuid: price.price_list_uuid,
        price_list_name: price.price_list_name,
        price_list_price: price.price_list_price,
        price_list_desc: price.price_list_desc,
        price_list_status: price.price_list_status,
        price_list_order: price.price_list_order,
        price_list_business: price.price_business_as
          ? {
              business_uuid: price.price_business_as.business_uuid,
              business_name: price.price_business_as.business_name,
              business_desc: price.price_business_as.business_desc,
              business_province: price.price_business_as.business_province,
              business_regency: price.price_business_as.business_regency,
              business_subdistrict:
                price.price_business_as.business_subdistrict,
              business_address: price.price_business_as.business_address,
            }
          : null,
          price_list_media: price.price_media_as
          ? {
              media_uuid: price.price_media_as.media_uuid,
              media_name: price.price_media_as.media_name,
              media_hash_name: price.price_media_as.media_hash_name,
              media_url: price.price_media_as.media_url,
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
    const excludePagesUrl =
      "http://localhost:9900/api/v1/price_list/get_all_customer";

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
  post_price_list,
  put_price_list,
  delete_price_list,
  get_all_price_list,
  get_detail_price_list,
  get_uniqe_price_list,
  get_count_price_list,
  get_price_byBusiness,
};
