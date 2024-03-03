const db = require("../models");
const tbl_business = db.tbl_business;
const tbl_teams = db.tbl_teams;
const tbl_media = db.tbl_media;
const tbl_customer = db.tbl_customer;
const tbl_scopes = db.tbl_scopes;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const Joi = require("joi");
const { Op } = require("sequelize");
const fs = require('fs');
const jwt = require("jsonwebtoken");

const teamsSchema = Joi.object({
  team_name: Joi.string().required().messages({
    'string.empty': 'Name tidak boleh kosong',
  }),
  team_job_desc: Joi.string().required().messages({
    'string.empty': 'Deskripsi tidak boleh kosong',
  }),
  team_business: Joi.string().required().messages({
    'string.base': 'Bisnis tidak boleh kosong',
  }),
  team_scope: Joi.string().required().messages({
    'string.base': 'Scope tidak boleh kosong',
  }),
});

const updateTeamsSchema = Joi.object({
  team_name: Joi.string().required().messages({
    'string.empty': 'Name tidak boleh kosong',
  }),
  team_job_desc: Joi.string().required().messages({
    'string.empty': 'Deskripsi tidak boleh kosong',
  }),
  team_business: Joi.string().required().messages({
    'string.base': 'Bisnis tidak boleh kosong',
  }),
  team_scope: Joi.string().required().messages({
    'string.base': 'Scope tidak boleh kosong',
  }),
});

const uuidSchema = Joi.object({
  team_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    team_name: Joi.alternatives()
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

const querySchemaByScope = Joi.object({
  team_business: Joi.string().guid({ version: "uuidv4" }).optional(),
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
    team_name: Joi.alternatives()
      .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
      .optional(),
  }).optional(),
  order: Joi.object()
    .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
    .optional(),
});


const post_teams = async (req, res) => {
  try {
    const { error, value } = teamsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { team_name, team_job_desc, team_scope, team_business } =
      value;

    // Mencari bisnis dengan UUID
    const businessValid = await tbl_business.findOne({
      where: {
        business_uuid: team_business,
      },
    });

    // Jika bisnis tidak ditemukan, kembalikan kesalahan
    if (!businessValid) {
      return res.status(400).json({
        success: false,
        message: "Data tidak ditemukan",
        data: null,
      });
    }

    const scopesValid = await tbl_scopes.findOne({
      where: {
        scope_uuid: team_scope,
        scope_business: team_business,
      },
    });

    if (!scopesValid) {
      return res.status(400).json({
        success: false,
        message: "Data tidak berkaitan",
        data: null,
      });
    }

    const team_uuid = uuidv4();

    const new_teams = await tbl_teams.create({
      team_uuid: team_uuid,
      team_name: team_name,
      team_job_desc: team_job_desc,
      team_scope: team_scope,
      team_business: team_business,
    });

    if (!new_teams) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data",
        data: null,
      });
    }

    const update_media = await tbl_media.findOne({
      where: {
        media_uuid: team_uuid,
      },
    });

    if (update_media) {
      await update_media.update({
          media_uuid_table: team_uuid || update_media.media_uuid_table,
          media_table: "teams" || update_media.media_table,
          team_update_at: new Date(),
      });
  }
    res.status(200).json({
      success: true,
      message: "Sukses menambah data",
      data: {
        team_uuid: new_teams.team_uuid,
        team_name: new_teams.team_name,
        team_job_desc: new_teams.team_job_desc,
        team_scope: new_teams.team_scope,
        team_business: new_teams.team_business,
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

const put_teams = async (req, res) => {
  try {
    const team_uuid = req.params.team_uuid;
    const { error, value } = updateTeamsSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const update_teams = await tbl_teams.findOne({
      where: { 
        team_uuid,
      },
    });

    if (!update_teams) {
      return res.status(404).json({
        success: false,
        message: "Gagal merubah data",
        data: null,
      });
    }

    // Pengecekan UUID scope dan bisnis seperti pada post_teams
    const scopesValid = await tbl_scopes.findOne({
      where: {
        scope_uuid: value.team_scope, // Ubah team_scope menjadi value.team_scope
        scope_business: value.team_business,
      },
    });

    if (!scopesValid) {
      return res.status(400).json({
        success: false,
        message: "Data tidak berkaitan",
        data: null,
      });
    }

    if (
      (value.team_business && value.team_business !== update_teams.team_business) ||
      (value.team_scope && value.team_scope !== update_teams.team_scope)
    ) {
      const existingTeams = await tbl_teams.findOne({
        where: {
          [Op.or]: [
            {
              team_business: value.team_business,
              team_uuid: { [Op.ne]: team_uuid },
            },
            {
              team_scope: value.team_scope,
              team_uuid: { [Op.ne]: team_uuid },
            },
          ],
          team_delete_at: null,
        },
      });
    
      if (existingTeams) {
        return res.status(400).json({
          success: false,
          message: "Data Sudah di Gunakan",
          data: null,
        });
      }
    }
    

    await update_teams.update({
      team_name: value.team_name || update_teams.team_name,
      team_job_desc: value.team_job_desc || update_teams.team_job_desc,
      team_scope: value.team_scope || update_teams.team_scope,
      team_business: value.team_business || update_teams.team_business,
      team_update_at: new Date(),
    });    

    res.status(200).json({
      success: true,
      message: 'Berhasil merubah data',
      data: {
        team_uuid: update_teams.team_uuid,
        team_name: update_teams.team_name,
        team_job_desc: update_teams.team_job_desc,
        team_scope: update_teams.team_scope,
        team_business: update_teams.team_business,
      },
    });
  } catch (error) {
    console.log(error, 'Data Error');
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const delete_teams = async (req, res) => {
  const { error, value } = uuidSchema.validate(req.params);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
      data: null,
    });
  }

  const { team_uuid } = value;

  try {
    const deletedTeam = await tbl_teams.findOne({
      where: {
        team_uuid,
      },
    });

    if (!deletedTeam) {
      return res.status(400).json({
        success: false,
        message: 'Gagal menghapus data',
        data: null,
      });
    }

    const deleteMedia = await tbl_media.findAll({
      where: { 
          media_uuid_table: team_uuid, 
          media_table: "teams" 
      }
    })

    for (const media of deleteMedia) {
      const filePath = `./uploads/${media.media_category}/${media.media_hash_name}`;
      fs.unlink(filePath, (error) => {
        if (error) {
          console.error('Gagal Menghapus File:', error)
        } else {
          console.log('Sukses menghapus file')
        }
      })
    }

    await tbl_media.update(
      { 
        media_delete_at: new Date(),
      },
      {
        where: {
          media_uuid_table: team_uuid,
          media_table: "teams"
        }
      }
    );
    
    await deletedTeam.update({ 
      team_delete_at: new Date() 
    });

    res.status(200).json({
      success: true,
      message: 'Sukses Menghapus Data',
    });
  } catch (error) {
    console.error('Error saat menghapus data teams:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus data teams',
      error: error.message,
    });
  }
};

const get_detail_teams = async (req, res) => {
  const { error, value } = uuidSchema.validate(req.params);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
      data: null
    })
  }

  const {
    team_uuid,
  } = value;

  const detail_teams = await tbl_teams.findOne({
    where: {
      team_uuid,
      team_delete_at: null,
    },
    include: [
      {
        model: tbl_business,
        as: 'team_business_as',
        attributes: [
          "business_uuid",
          "business_name",
          "business_desc",
          "business_province",
          "business_regency",
          "business_subdistrict",
          "business_address",
          "business_customer",
        ]
      },
      {
        model: tbl_scopes,
        as: "team_scope_as",
        attributes: [
          "scope_uuid",
          "scope_name",
          "scope_desc",
          "scope_business",
        ],
      },
      {
        model: tbl_media,
        as: "team_media_as",
        attributes: ["media_uuid", "media_name", "media_hash_name"],
      }
    ]
  })

  if (!detail_teams) {
    return res.status(404).json({
      success: false,
      message: "Gagal Mendapatkan Data",
      data: null,
    });
  }

  const result = {
    success: true,
    message: "Sukses mendapatkan data",
    data: {
      team_uuid: detail_teams.team_uuid,
      team_name: detail_teams.team_name,
      team_job_desc: detail_teams.team_job_desc,
      team_business: detail_teams.team_business_as
        ? {
            business_uuid: detail_teams.team_business_as.business_uuid,
            business_name: detail_teams.team_business_as.business_name,
            business_desc: detail_teams.team_business_as.business_desc,
            business_province: detail_teams.team_business_as.business_province,
            business_regency: detail_teams.team_business_as.business_regency,
            business_subdistrict: detail_teams.team_business_as.business_subdistrict,
            business_address: detail_teams.team_business_as.business_address,
            business_customer: detail_teams.team_business_as.business_customer,
          }
        : null,
      team_scope: detail_teams.team_scope_as
        ? {
            scope_uuid: detail_teams.team_scope_as.scope_uuid,
            scope_name: detail_teams.team_scope_as.scope_name,
            scope_desc: detail_teams.team_scope_as.scope_desc,
            scope_business: detail_teams.team_scope_as.scope_business,
          }
        : null,
      team_media: detail_teams.team_media_as
        ? {
            media_uuid: detail_teams.team_media_as.media_uuid,
            media_name: detail_teams.team_media_as.media_name,
            media_hash_name: detail_teams.team_media_as.media_hash_name,
          }
        : null,
    }
  }

  res.status(200).json(result);
};

const get_all_teams = async (req, res) => {
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
      order = { team_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      team_delete_at: null,
    };

    if (filter.team_name) {
      const filterNames = Array.isArray(filter.team_name)
        ? filter.team_name
        : filter.team_name.split(",");

      if (filterNames.length > 0) {
        whereClause.team_name = {
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
        [Sequelize.Op.or]: [
          { team_name: { [Sequelize.Op.like]: `%${keyword}%` } },
          { team_job_desc: { [Sequelize.Op.like]: `%${keyword}%` } },
          { '$team_business_as.business_name$': { [Sequelize.Op.like]: `%${keyword}%` } }
        ]
      };
      offset = 0;
    
      whereClause[Sequelize.Op.and] = whereClause[Sequelize.Op.and]
        ? [...whereClause[Sequelize.Op.and], keywordClause]
        : [keywordClause];
    }

    const data = await tbl_teams.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
          model: tbl_business,
          as: "team_business_as",
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
          model: tbl_scopes,
          as: "team_scope_as",
          attributes: [
            "scope_uuid",
            "scope_name",
            "scope_desc",
            "scope_business",
          ],
        },
        {
          model: tbl_media,
          as: "team_media_as",
          attributes: ["media_uuid", "media_name", "media_hash_name", "media_url"],
        },
      ],
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((teams) => ({
        team_uuid: teams.team_uuid,
        team_name: teams.team_name,
        team_job_desc: teams.team_job_desc,
        team_business: teams.team_business_as
          ? {
              business_uuid: teams.team_business_as.business_uuid,
              business_name: teams.team_business_as.business_name,
              business_desc: teams.team_business_as.business_desc,
              business_province: teams.team_business_as.business_province,
              business_regency: teams.team_business_as.business_regency,
              business_subdistrict: teams.team_business_as.business_subdistrict,
              business_address: teams.team_business_as.business_address,
              business_customer: teams.team_business_as.business_customer,
            }
          : null,
        team_scope: teams.team_scope_as
          ? {
              scope_uuid: teams.team_scope_as.scope_uuid,
              scope_name: teams.team_scope_as.scope_name,
              scope_desc: teams.team_scope_as.scope_desc,
              scope_business: teams.team_scope_as.scope_business,
            }
          : null,
        team_media: teams.team_media_as
          ? {
              media_uuid: teams.team_media_as.media_uuid,
              media_name: teams.team_media_as.media_name,
              media_url: teams.team_media_as.media_url,
              media_hash_name: teams.team_media_as.media_hash_name,
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
    const excludePagesUrl = "http://localhost:9900/api/v1/teams/get_all";

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

const get_uniqe_teams = async (req, res) => {
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
    const tableAttributes = tbl_teams.rawAttributes;
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
      const values = await tbl_teams.findAll({
        attributes: [[Sequelize.fn("DISTINCT", Sequelize.col(f)), f]],
        where: {
          team_delete_at: null,
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

const get_count_teams = async (req, res) => {
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
          const count = await tbl_teams.count({
            where: {
              [fieldName]: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.eq]: value,
              },
              team_delete_at: null,
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

const get_all_byScope = async (req, res) => {
  try {
    const { error, value } = querySchemaByScope.validate(req.query);
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
      team_business = null,
      limit = null,
      page = null,
      keyword = "",
      filter = {},
      order = { team_id: "desc" },
    } = value;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      [Op.and]: [
        { team_delete_at: null },
        {
          [Op.or]: [
            {
              team_business: team_business
                ? team_business
                : { [Op.ne]: null },
            },
            { team_name: { [Op.like]: `%${keyword}%` } },
          ],
        },
        Sequelize.where(
          Sequelize.col("team_business_as.business_customer"),
          uuid
        ),
      ],
    };

    if (filter.team_name) {
      const filterNames = Array.isArray(filter.team_name)
        ? filter.team_name
        : filter.team_name.split(",");

      if (filterNames.length > 0) {
        whereClause[Op.and].push({
          team_name: {
            [Op.or]: filterNames.map((name) => ({
              [Op.like]: `%${name.trim()}%`,
            })),
          },
        });
      } else {
        console.log("Empty filter.team_name");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }
    if (keyword) {
      const keywordClause = {
        [Sequelize.Op.or]: [
          { team_name: { [Sequelize.Op.like]: `%${keyword}%` } },
          { team_job_desc: { [Sequelize.Op.like]: `%${keyword}%` } },
          { '$team_business_as.business_name$': { [Sequelize.Op.like]: `%${keyword}%` } }
        ]
      };
      offset = 0;
    
      whereClause[Sequelize.Op.and] = whereClause[Sequelize.Op.and]
        ? [...whereClause[Sequelize.Op.and], keywordClause]
        : [keywordClause];
    }


    const data = await tbl_teams.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
      include: [
        {
          model: tbl_business,
          as: "team_business_as",
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
          model: tbl_scopes,
          as: "team_scope_as",
          attributes: [
            "scope_uuid",
            "scope_name",
            "scope_desc",
            "scope_business",
          ],
        },
        {
          model: tbl_media,
          as: "team_media_as",
          attributes: ["media_uuid", "media_name", "media_hash_name", "media_url"],
        },
      ],
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((teams) => ({
        team_uuid: teams.team_uuid,
        team_name: teams.team_name,
        team_job_desc: teams.team_job_desc,
        team_business: teams.team_business_as
          ? {
              business_uuid: teams.team_business_as.business_uuid,
              business_name: teams.team_business_as.business_name,
              business_desc: teams.team_business_as.business_desc,
              business_province: teams.team_business_as.business_province,
              business_regency: teams.team_business_as.business_regency,
              business_subdistrict: teams.team_business_as.business_subdistrict,
              business_address: teams.team_business_as.business_address,
              business_customer: teams.team_business_as.business_customer,
            }
          : null,
        team_scope: teams.team_scope_as
          ? {
              scope_uuid: teams.team_scope_as.scope_uuid,
              scope_name: teams.team_scope_as.scope_name,
              scope_desc: teams.team_scope_as.scope_desc,
              scope_business: teams.team_scope_as.scope_business,
            }
          : null,
        team_media: teams.team_media_as
          ? {
              media_uuid: teams.team_media_as.media_uuid,
              media_name: teams.team_media_as.media_name,
              media_url: teams.team_media_as.media_url,
              media_hash_name: teams.team_media_as.media_hash_name,
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
    const excludePagesUrl = "http://localhost:9900/api/v1/teams/get_all";

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
}

module.exports = {
  post_teams,
  put_teams,
  delete_teams,
  get_detail_teams,
  get_all_teams,
  get_uniqe_teams,
  get_count_teams,
  get_all_byScope,
};
