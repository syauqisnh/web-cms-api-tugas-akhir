const db = require('../models');
const tbl_scopes = db.tbl_scopes;
const tbl_business = db.tbl_business;
const tbl_customer = db.tbl_customer;
const {v4: uuidv4} = require('uuid');
const Sequelize = require('sequelize');
const Joi = require('joi');
const { Op } = require("sequelize");

const scopeSchema = Joi.object({
    scope_name: Joi.string().required(),
    scope_desc: Joi.string().required(),
});

const updateScopeSchema = Joi.object({
  scope_name: Joi.string().required(),
  scope_desc: Joi.string().required(),
});

const uuidSchema = Joi.object({
  scope_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
});

const querySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
      scope_name: Joi.alternatives().try(
          Joi.string().trim(),
          Joi.array().items(Joi.string().trim())
      ).optional()
  }).optional(),
  order: Joi.object().pattern(
      Joi.string(), Joi.string().valid('asc', 'desc', 'ASC', 'DESC')
  ).optional()
});

const querySchemaByCustomer = Joi.object({
  business_customer: Joi.string().guid({ version: "uuidv4" }).optional(),
  limit: Joi.number().integer().min(1).optional(),
  page: Joi.number().integer().min(1).optional(),
  keyword: Joi.string().trim().optional(),
  filter: Joi.object({
      scope_name: Joi.alternatives().try(
          Joi.string().trim(),
          Joi.array().items(Joi.string().trim())
      ).optional()
  }).optional(),
  order: Joi.object().pattern(
      Joi.string(), Joi.string().valid('asc', 'desc', 'ASC', 'DESC')
  ).optional()
});

const querySchemaUniqe = Joi.object({
  field: Joi.string().required().pattern(new RegExp('^[a-zA-Z0-9,_]+$'))
});

const querySchemaCount = Joi.object({
  field: Joi.object().pattern(
      Joi.string(), 
      Joi.alternatives().try(
          Joi.string().trim(),
          Joi.array().items(Joi.string().trim())
      )
  ).required()
});

const post_scope = async (req, res) => {
  try {
    const { error, value } = scopeSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
            data: null
        });
    }
  
    const {
        scope_name,
        scope_desc
    } = value;

    const customerUuid = req.session.userUuid;

    const businesses = await tbl_business.findAll({
      where: { business_customer: customerUuid }
    });

    if (!businesses || businesses.length === 0) {
        return res.status(404).json({
            success: false,
            message: "Bisnis tidak ditemukan untuk customer ini",
            data: null
        });
    }

    let businessToUse = null;
    for (const business of businesses) {
      const existingScope = await tbl_scopes.findOne({
        where: { 
          scope_business: business.business_uuid,
          scope_delete_at: null,
        }
      });

      if (!existingScope) {
        businessToUse = business;
        break;
      }
    }

    // Jika semua business_uuid sudah digunakan
    if (!businessToUse) {
      return res.status(404).json({
          success: false,
          message: "Tidak ada business_uuid yang tersedia untuk digunakan",
          data: null
      });
    }

    // Jika ada business_uuid yang belum digunakan, buat scope baru
    const scope_uuid = uuidv4();
    const new_scope = await tbl_scopes.create({
        scope_uuid: scope_uuid,
        scope_name: scope_name,
        scope_desc: scope_desc,
        scope_business: businessToUse.business_uuid
    });

    if (!new_scope) {
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
            scope_uuid: new_scope.scope_uuid,
            scope_name: new_scope.scope_name,
            scope_desc: new_scope.scope_desc,
            scope_business: new_scope.scope_business
        },
    });
  } catch (error) {
    console.error("Error di post_scope:", error);
    return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server",
        data: null
    });
  }
};

const put_scope = async (req, res) => {
  try {
    const scope_uuid = req.params.scope_uuid;
    const { error, value } = updateScopeSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const update_scope = await tbl_scopes.findOne({
      where: { scope_uuid },
    });

    if (!update_scope) {
      return res.status(404).json({
        success: false,
        message: "Bisnis tidak ditemukan",
        data: null,
      });
    }

    await update_scope.update({
      scope_name: value.scope_name || update_scope.scope_name,
      scope_desc: value.scope_desc || update_scope.scope_desc,
      scope_update_at: new Date()
    })

    res.status(200).json({
      success: true,
      message: 'Berhasil merubah data',
      data: {
        scope_name: update_scope.scope_name,
        scope_desc: update_scope.scope_desc,
      }
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

const delete_scope = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { scope_uuid } = value;

    const delete_scope = await tbl_scopes.findOne({
      where: { scope_uuid },
    });

    if (!delete_scope) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data",
        data: null,
      });
    }

    await delete_scope.update({ scope_delete_at: new Date() });

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

const get_all_scope = async (req, res) => {
  try {
    const { error, value } = querySchema.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
                data: null
            });
        }

        const {
            limit = null,
            page = null,
            keyword = '',
            filter = {},
            order = { scope_id: 'desc' }
        } = value;

        let offset = limit && page ? (page - 1) * limit : 0;
        const orderField = Object.keys(order)[0];
        const orderDirection = order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

        const whereClause = {
            scope_delete_at: null,
        }

        if (filter.scope_name) {
            const filterNames = Array.isArray(filter.scope_name)
            ? filter.scope_name
            : filter.scope_name.split(',');

            if (filterNames.length > 0) {
                whereClause.scope_name = {
                  [Sequelize.Op.or]: filterNames.map(name => ({
                    [Sequelize.Op.like]: `%${name.trim()}%`,
                  })),
                  [Sequelize.Op.not]: null,
                };
              } else {
                console.log("Empty filter.scope_name");
                return res.status(404).json({
                  success: false,
                  message: 'Data Tidak Di Temukan'
                });
              }
        }
        if (keyword) {
            const keywordClause = {
              [Sequelize.Op.like]: `%${keyword}%`,
            };
            offset = 0; 
      
            whereClause.scope_name = whereClause.scope_name
              ? { [Sequelize.Op.and]: [whereClause.scope_name, keywordClause] }
              : keywordClause;
        }

        const data = await tbl_scopes.findAndCountAll({
            where: whereClause,
            order: [[orderField, orderDirection]],
            limit: limit ? parseInt(limit) : null,
            offset: offset ? parseInt(offset) : null,
            include: [
              {
                model: tbl_business,
                as: 'scope_business_as',
                attributes: ['business_uuid', 'business_name', 'business_desc', 'business_province', 'business_regency', 'business_subdistrict', 'business_address'],
              },
            ]
          });
          
          const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

          const result = {
            success: true,
            message: "Sukses mendapatkan data",
            data: data.rows.map((scope) => ({
                scope_uuid: scope.scope_uuid,
                scope_name: scope.scope_name,
                scope_desc: scope.scope_desc,
                scope_business: scope.scope_business_as
                ? {
                  business_uuid: scope.scope_business_as.business_uuid,
                  business_name: scope.scope_business_as.business_name,
                  business_desc: scope.scope_business_as.business_desc,
                  business_province: scope.scope_business_as.business_province,
                  business_regency: scope.scope_business_as.business_regency,
                  business_subdistrict: scope.scope_business_as.business_subdistrict,
                  business_address: scope.scope_business_as.business_address,
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
            return res.status(404).json({
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

          const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
          const excludePagesUrl = "http://localhost:9900/api/v1/scope/get_all";
      
          if (currentUrl === excludePagesUrl) {
            delete result.pages
          }
      
          res.status(200).json(result);
  } catch (error) {
    console.log(error, 'Data Error');
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      data: null
    })
  }
};

const get_detail_scope = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { scope_uuid } = value;

    const detail_scope = await tbl_scopes.findOne({
      where: {
        scope_uuid,
        scope_delete_at: null,
      },
      include: [
        {
          model: tbl_business,
          as: 'scope_business_as',
          attributes: ['business_uuid', 'business_name', 'business_desc', 'business_province', 'business_regency', 'business_subdistrict', 'business_address'],
        },
      ]
    });

    if (!detail_scope) {
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
        scope_uuid: detail_scope.scope_uuid,
        scope_name: detail_scope.scope_name,
        scope_desc: detail_scope.scope_desc,
        scope_business: detail_scope.scope_business_as
        ? {
          business_uuid: detail_scope.scope_business_as.business_uuid,
          business_name: detail_scope.scope_business_as.business_name,
          business_desc: detail_scope.scope_business_as.business_desc,
          business_province: detail_scope.scope_business_as.business_province,
          business_regency: detail_scope.scope_business_as.business_regency,
          business_subdistrict: detail_scope.scope_business_as.business_subdistrict,
          business_address: detail_scope.scope_business_as.business_address,
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

const get_unique_scope = async (req, res) => {
  try {
    const {error, value} = querySchemaUniqe.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null
      });
    }
  
    const { field } = value;
          const fieldsArray = field.split(',');
          const tableAttributes = tbl_scopes.rawAttributes;
          const invalidFields = fieldsArray.filter((f) => !(f in tableAttributes));
      
          if (invalidFields.length > 0) {
              return res.status(200).json({
                  success: false,
                  message: 'Gagal mendapatkan data',
                  data: null
              })
          }
  
          const uniqeValues = {};
  
          for (const f of fieldsArray) {
              const values = await tbl_scopes.findAll({
                  attributes: [[Sequelize.fn('DISTINCT', Sequelize.col(f)), f]],
                  where: {
                      scope_delete_at: null,
                  }
              });
  
              if (values && values.length > 0) {
                  uniqeValues[f] = values.map((item) => item[f]);
              }
          }
  
          return res.status(200).json({
            success: true,
            message: 'Sukses mendapatkan data',
            data: uniqeValues,
        })
  } catch (error) {
    console.log(error, 'Data Error');
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        data: null
    })
  }
};

const get_count_scope = async (req, res) => {
  try {
    const { error, value } = querySchemaCount.validate(req.query);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
            data: null
        });
    }

    const { field } = value;

    const counts = {};

    for (const fieldName in field) {
      if (field.hasOwnProperty(fieldName)) {
        const values = Array.isArray(field[fieldName])
          ? field[fieldName]
          : field[fieldName].split(',').map((val) => val.trim());

        const valueCounts = {}; 

        for (const value of values) {
          const count = await tbl_scopes.count({
            where: {
              [fieldName]: {
                [Sequelize.Op.not]: null,
                [Sequelize.Op.eq]: value,
              },
              scope_delete_at: null
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
      message: 'Sukses mendapatkan data',
      data: counts,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null,
    });
  }
};

const get_scope_byCustomer = async (req, res) => {
  try {
    const { error, value } = querySchema.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
                data: null
            });
        }

        const {
            limit = null,
            page = null,
            keyword = '',
            filter = {},
            order = { scope_id: 'desc' }
        } = value;

        let offset = limit && page ? (page - 1) * limit : 0;
        const orderField = Object.keys(order)[0];
        const orderDirection = order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

        const whereClause = {
            scope_delete_at: null,
        }

        if (filter.scope_name) {
            const filterNames = Array.isArray(filter.scope_name)
            ? filter.scope_name
            : filter.scope_name.split(',');

            if (filterNames.length > 0) {
                whereClause.scope_name = {
                  [Sequelize.Op.or]: filterNames.map(name => ({
                    [Sequelize.Op.like]: `%${name.trim()}%`,
                  })),
                  [Sequelize.Op.not]: null,
                };
              } else {
                console.log("Empty filter.scope_name");
                return res.status(404).json({
                  success: false,
                  message: 'Data Tidak Di Temukan'
                });
              }
        }
        if (keyword) {
            const keywordClause = {
              [Sequelize.Op.like]: `%${keyword}%`,
            };
            offset = 0; 
      
            whereClause.scope_name = whereClause.scope_name
              ? { [Sequelize.Op.and]: [whereClause.scope_name, keywordClause] }
              : keywordClause;
        }

        const data = await tbl_scopes.findAndCountAll({
            where: whereClause,
            order: [[orderField, orderDirection]],
            limit: limit ? parseInt(limit) : null,
            offset: offset ? parseInt(offset) : null,
            include: [
              {
                model: tbl_business,
                as: 'scope_business_as',
                attributes: ['business_uuid', 'business_name', 'business_desc', 'business_province', 'business_regency', 'business_subdistrict', 'business_address'],
              },
            ]
          });
          
          const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

          const result = {
            success: true,
            message: "Sukses mendapatkan data",
            data: data.rows.map((scope) => ({
                scope_uuid: scope.scope_uuid,
                scope_name: scope.scope_name,
                scope_desc: scope.scope_desc,
                scope_business: scope.scope_business_as
                ? {
                  business_uuid: scope.scope_business_as.business_uuid,
                  business_name: scope.scope_business_as.business_name,
                  business_desc: scope.scope_business_as.business_desc,
                  business_province: scope.scope_business_as.business_province,
                  business_regency: scope.scope_business_as.business_regency,
                  business_subdistrict: scope.scope_business_as.business_subdistrict,
                  business_address: scope.scope_business_as.business_address,
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
            return res.status(404).json({
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

          const currentUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
          const excludePagesUrl = "http://localhost:9900/api/v1/scope/get_all";
      
          if (currentUrl === excludePagesUrl) {
            delete result.pages
          }
      
          res.status(200).json(result);
  } catch (error) {
    console.log(error, 'Data Error');
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      data: null
    })
  }
};


module.exports = {
    post_scope,
    put_scope,
    delete_scope,
    get_all_scope,
    get_detail_scope,
    get_unique_scope,
    get_count_scope,
    get_scope_byCustomer,
}