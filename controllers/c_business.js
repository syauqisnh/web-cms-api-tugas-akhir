const db = require("../models");
const tbl_business = db.tbl_business;
const tbl_customer = db.tbl_customer;
const jwt = require("jsonwebtoken");
const tbl_user = db.tbl_user;
const tbl_media = db.tbl_media;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const Joi = require("joi");
const { Op } = require("sequelize");
const fs = require('fs');

const businessSchema = Joi.object({
  business_name: Joi.string().required().messages({
    'string.empty': 'Nama tidak boleh kosong',
  }),
  business_desc: Joi.string().required().messages({
    'string.empty': 'Deskripsi tidak boleh kosong',
  }),
  business_province: Joi.string().required().messages({
    'string.empty': 'Provinsi tidak boleh kosong',
  }),
  business_regency: Joi.string().required().messages({
    'string.empty': 'Kabupaten tidak boleh kosong',
  }),
  business_subdistrict: Joi.string().required().messages({
    'string.empty': 'Kecamatan tidak boleh kosong',
  }),
  business_address: Joi.string().required().messages({
    'string.empty': 'Alamat tidak boleh kosong',
  }),
  business_notelp: Joi.string().min(10).max(14).required().messages({
    'string.empty': 'Kontak tidak boleh kosong',
  }),
  business_email: Joi.string().email().required().messages({
    'string.empty': 'Email tidak boleh kosong',
  }),
  business_link_wa: Joi.string().required().messages({
    'string.empty': 'Link WA tidak boleh kosong',
  }),
});

const updateBusinessSchema = Joi.object({
  business_name: Joi.string().required().messages({
    'string.empty': 'Nama tidak boleh kosong',
  }),
  business_desc: Joi.string().required().messages({
    'string.empty': 'Deskripsi tidak boleh kosong',
  }),
  business_province: Joi.string().required().messages({
    'string.empty': 'Provinsi tidak boleh kosong',
  }),
  business_regency: Joi.string().required().messages({
    'string.empty': 'Kabupaten tidak boleh kosong',
  }),
  business_subdistrict: Joi.string().required().messages({
    'string.empty': 'Kecamatan tidak boleh kosong',
  }),
  business_address: Joi.string().required().messages({
    'string.empty': 'Alamat tidak boleh kosong',
  }),
  business_notelp: Joi.string().min(10).max(14).required().messages({
    'string.empty': 'Kontak tidak boleh kosong',
  }),
  business_email: Joi.string().email().required().messages({
    'string.empty': 'Email tidak boleh kosong',
  }),
  business_link_wa: Joi.string().required().messages({
    'string.empty': 'Link WA tidak boleh kosong',
  }),
});

const uuidSchema = Joi.object({
  business_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    business_name: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});

const querySchemaByCustomer = Joi.object({
  business_customer: Joi.string().guid({ version: "uuidv4" }).optional(),
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    business_name: Joi.alternatives()
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

const post_business = async (req, res) => {
  try {
    const { error, value } = businessSchema.validate(req.body);

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    uuid = decoded.uuid;

    const administrator = await tbl_user.findOne({
      attributes: ["user_uuid", "user_username"],
      where: {
        user_uuid: uuid,
      },
    });
    const customer = await tbl_customer.findOne({
      attributes: ["customer_uuid", "customer_username"],
      where: {
        customer_uuid: uuid,
      },
    });

    if (!administrator && !customer) {
      return res.status(404).json({
        success: false,
        message: "User Tidak DI Temukan",
        data: null,
      });
    }

    const {
      business_name,
      business_desc,
      business_province,
      business_regency,
      business_subdistrict,
      business_address,
      business_notelp,
      business_email,
      business_link_wa,
    } = value;

    const business_uuid = uuidv4();

    const create_business = await tbl_business.create({
      business_uuid: business_uuid,
      business_name: business_name,
      business_desc: business_desc,
      business_province: business_province,
      business_regency: business_regency,
      business_subdistrict: business_subdistrict,
      business_address: business_address,
      business_notelp: business_notelp,
      business_email: business_email,
      business_link_wa: business_link_wa,
      business_customer: uuid,
    });

    if (!create_business) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data",
        data: null,
      });
    } 

    const update_media = await tbl_media.findOne({
      where: {
        media_uuid: business_uuid,
      },
    });

    if (update_media) {
      await update_media.update({
        media_uuid_table: business_uuid || update_media.media_uuid_table,
        media_table: "business" || update_media.media_table,
        business_update_at: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Berhasil menambahkan data bisnis",
      data: {
        business_uuid: create_business.business_uuid,
        business_name: create_business.business_name,
        business_desc: create_business.business_desc,
        business_province: create_business.business_province,
        business_regency: create_business.business_regency,
        business_subdistrict: create_business.business_subdistrict,
        business_address: create_business.business_address,
        business_notelp: create_business.business_notelp,
        business_email: create_business.business_email,
        business_link_wa: create_business.business_link_wa,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const put_business = async (req, res) => {
  try {
    const business_uuid = req.params.business_uuid;
    const { error, value } = updateBusinessSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const update_business = await tbl_business.findOne({
      where: { business_uuid },
    });

    if (!update_business) {
      return res.status(404).json({
        success: false,
        message: "Bisnis tidak ditemukan",
        data: null,
      });
    }

    await update_business.update({
      business_name: value.business_name || update_business.business_name,
      business_desc: value.business_desc || update_business.business_desc,
      business_province:
        value.business_province || update_business.business_province,
      business_regency:
        value.business_regency || update_business.business_regency,
      business_subdistrict:
        value.business_subdistrict || update_business.business_subdistrict,
      business_address:
        value.business_address || update_business.business_address,
      business_notelp: value.business_notelp || update_business.business_notelp,
      business_email: value.business_email || update_business.business_email,
      business_link_wa:
        value.business_link_wa || update_business.business_link_wa,
      business_update_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        business_name: update_business.business_name,
        business_desc: update_business.business_desc,
        business_province: update_business.business_province,
        business_regency: update_business.business_regency,
        business_subdistrict: update_business.business_subdistrict,
        business_address: update_business.business_address,
        business_notelp: update_business.business_notelp,
        business_email: update_business.business_email,
        business_link_wa: update_business.business_link_wa,
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

const delete_business = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { business_uuid } = value;

    const delete_business = await tbl_business.findOne({
      where: { business_uuid },
    });

    if (!delete_business) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data",
        data: null,
      });
    }

    const deleteMedia = await tbl_media.findAll({
      where: {
        media_uuid_table: business_uuid,
        media_table: 'business'
      }
    })

    for (const media of deleteMedia) {
      const filePath = `./uploads/${media.media_category}/${media.media_hash_name}`;
      fs.unlink(filePath, (error) => {
        if (error) {
          console.error('File gagal di hapus:', error)
        } else {
          console.log('Sukses menambahkan data')
        }
      })
    }
    
    await tbl_media.update(
      { 
        media_delete_at: new Date() 
      },
      { 
        where: { 
          media_uuid_table: business_uuid, 
          media_table: "business" 
      } 
      }
    );

    await delete_business.update({ 
      business_delete_at: new Date() 
    });


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

const get_detail_business = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { business_uuid } = value;

    const detail_business = await tbl_business.findOne({
      where: {
        business_uuid,
        business_delete_at: null,
      },
      include: [
        {
          model: tbl_customer,
          as: "business_customer_as",
          attributes: [
            "customer_uuid",
            "customer_full_name",
            "customer_nohp",
            "customer_email",
            "customer_address",
          ],
        },
        {
          model: tbl_media,
          as: "business_media_as",
          attributes: ["media_uuid", "media_name", "media_hash_name"],
        },
      ],
    });

    if (!detail_business) {
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
        business_uuid: detail_business.business_uuid,
        business_name: detail_business.business_name,
        business_desc: detail_business.business_desc,
        business_province: detail_business.business_province,
        business_regency: detail_business.business_regency,
        business_subdistrict: detail_business.business_subdistrict,
        business_address: detail_business.business_address,
        business_notelp: detail_business.business_notelp,
        business_email: detail_business.business_email,
        business_link_wa: detail_business.business_link_wa,
        business_customer: detail_business.business_customer_as
          ? {
              customer_uuid: detail_business.business_customer_as.customer_uuid,
              customer_full_name:
                detail_business.business_customer_as.customer_full_name,
              customer_nohp: detail_business.business_customer_as.customer_nohp,
              customer_email:
                detail_business.business_customer_as.customer_email,
              customer_address:
                detail_business.business_customer_as.customer_address,
            }
          : null,
        business_media: detail_business.business_media_as
          ? {
              media_uuid: detail_business.business_media_as.media_uuid,
              media_name: detail_business.business_media_as.media_name,
              media_hash_name:
                detail_business.business_media_as.media_hash_name,
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

const get_all_business = async (req, res) => {
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
      order = { business_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      business_delete_at: null,
    };

    if (filter.business_name) {
      const filterNames = Array.isArray(filter.business_name)
        ? filter.business_name
        : filter.business_name.split(",");

      if (filterNames.length > 0) {
        whereClause.business_name = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.business_name");
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

      whereClause.business_name = whereClause.business_name
        ? { [Sequelize.Op.and]: [whereClause.business_name, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_business.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
          model: tbl_customer,
          as: "business_customer_as",
          attributes: [
            "customer_uuid",
            "customer_full_name",
            "customer_nohp",
            "customer_email",
            "customer_address",
          ],
        },
        {
          model: tbl_user,
          as: "business_user_as",
          attributes: [
            "user_uuid",
            "user_full_name",
            "user_nohp",
            "user_email",
            "user_address",
          ],
        },
        {
          model: tbl_media,
          as: "business_media_as",
          attributes: [
            "media_uuid",
            "media_name",
            "media_hash_name",
            "media_url",
          ],
        },
      ],
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((business) => ({
        business_uuid: business.business_uuid,
        business_name: business.business_name,
        business_desc: business.business_desc,
        business_province: business.business_province,
        business_regency: business.business_regency,
        business_subdistrict: business.business_subdistrict,
        business_address: business.business_address,
        business_notelp: business.business_notelp,
        business_email: business.business_email,
        business_link_wa: business.business_link_wa,
        business_customer: business.business_customer_as
        ? {
            customer_uuid: business.business_customer_as.customer_uuid,
            customer_full_name: business.business_customer_as.customer_full_name,
            customer_nohp: business.business_customer_as.customer_nohp,
            customer_email: business.business_customer_as.customer_email,
            customer_address: business.business_customer_as.customer_address,
          }
        : business.business_user_as 
        ? {
            user_uuid: business.business_user_as.user_uuid,
            user_full_name: business.business_user_as.user_full_name,
            user_nohp: business.business_user_as.user_nohp,
            user_email: business.business_user_as.user_email,
            user_address: business.business_user_as.user_address,
          }
        : null, 
        business_media: business.business_media_as
          ? {
              media_uuid: business.business_media_as.media_uuid,
              media_name: business.business_media_as.media_name,
              media_hash_name: business.business_media_as.media_hash_name,
              media_url: business.business_media_as.media_url,
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
    const excludePagesUrl = "http://localhost:9900/api/v1/business/get_all";

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

const get_uniqe_business = async (req, res) => {
  try {
    const { error, value } = querySchemaUniqe.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message:
          "Validasi error: " + error.details.map((d) => d.message).join(", "),
        data: null,
      });
    }

    const { field } = value;

    const pemetaanFieldURLkeDB = {
      customer_full_name: "business_customer",
    };

    const rawFieldsArray = field.split(",");
    const fieldsArray = rawFieldsArray.map((f) => pemetaanFieldURLkeDB[f] || f);

    const tableAttributes = tbl_business.rawAttributes;
    const invalidFields = fieldsArray.filter((f) => !(f in tableAttributes));

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Parameter tidak valid (kolom tidak ditemukan): " +
          invalidFields.join(", "),
        data: null,
      });
    }

    const fieldMappings = {
      business_customer: {
        model: tbl_customer,
        as: "business_customer_as",
        column: "customer_full_name",
      },
    };

    const uniqueValues = {};

    for (let i = 0; i < fieldsArray.length; i++) {
      const f = fieldsArray[i];
      const rawField = rawFieldsArray[i];
      const mapping = fieldMappings[f];

      if (mapping) {
        const values = await tbl_business.findAll({
          attributes: [
            [
              Sequelize.literal(`DISTINCT ${mapping.as}.${mapping.column}`),
              mapping.column,
            ],
          ],
          include: [{ model: mapping.model, as: mapping.as, attributes: [] }],
          where: { business_delete_at: null },
          raw: true,
        });
        uniqueValues[rawField] = values.map((item) => item[mapping.column]);
      } else {
        const otherValues = await tbl_business.findAll({
          attributes: [[Sequelize.literal(`DISTINCT \`${f}\``), f]],
          where: { business_delete_at: null },
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
    console.log(error, "Data Error");
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
      data: null,
    });
  }
};

const get_count_business = async (req, res) => {
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
          const count = await tbl_business.count({
            where: {
              [fieldName]: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.eq]: value,
              },
              business_delete_at: null,
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

const get_business_byCustomer = async (req, res) => {
  try {
    const { error, value } = querySchemaByCustomer.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const {
      business_customer = null,
      limit = null,
      page = null,
      keyword = "",
      filter = {},
      order = { business_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      business_customer: business_customer,
      business_delete_at: null,
    };

    if (filter.business_name) {
      const filterNames = Array.isArray(filter.business_name)
        ? filter.business_name
        : filter.business_name.split(",");

      if (filterNames.length > 0) {
        whereClause.business_name = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.business_name");
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

      whereClause.business_name = whereClause.business_name
        ? { [Sequelize.Op.and]: [whereClause.business_name, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_business.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
          model: tbl_customer,
          as: "business_customer_as",
          attributes: [
            "customer_uuid",
            "customer_full_name",
            "customer_nohp",
            "customer_email",
            "customer_address",
          ],
        },
        {
          model: tbl_media,
          as: "business_media_as",
          attributes: [
            "media_uuid",
            "media_name",
            "media_hash_name",
            "media_url",
          ],
        },
      ],
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((business) => ({
        business_uuid: business.business_uuid,
        business_name: business.business_name,
        business_desc: business.business_desc,
        business_province: business.business_province,
        business_regency: business.business_regency,
        business_subdistrict: business.business_subdistrict,
        business_address: business.business_address,
        business_notelp: business.business_notelp,
        business_email: business.business_email,
        business_link_wa: business.business_link_wa,
        business_customer: business.business_customer_as
          ? {
              customer_uuid: business.business_customer_as.customer_uuid,
              customer_full_name:
                business.business_customer_as.customer_full_name,
              customer_nohp: business.business_customer_as.customer_nohp,
              customer_email: business.business_customer_as.customer_email,
              customer_address: business.business_customer_as.customer_address,
            }
          : null,
        business_media: business.business_media_as
          ? {
              media_uuid: business.business_media_as.media_uuid,
              media_name: business.business_media_as.media_name,
              media_hash_name: business.business_media_as.media_hash_name,
              media_url: business.business_media_as.media_url,
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
    const excludePagesUrl = "http://localhost:9900/api/v1/business/get_all";

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
  post_business,
  put_business,
  delete_business,
  get_all_business,
  get_detail_business,
  get_uniqe_business,
  get_count_business,
  get_business_byCustomer,
};
