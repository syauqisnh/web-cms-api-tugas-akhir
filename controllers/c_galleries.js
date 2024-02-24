const db = require("../models");
const tbl_galleries = db.tbl_galleries;
const tbl_media = db.tbl_media;
const tbl_business = db.tbl_business;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const Joi = require("joi");

const galleriesSchema = Joi.object({
    gallery_name: Joi.string().required().messages({
      'string.empty': 'Name tidak boleh kosong',
    }),
    gallery_desc: Joi.string().required().messages({
      'string.empty': 'deskripsi tidak boleh kosong',
    }),
    gallery_business: Joi.string().required().messages({
      'string.empty': 'Bisnis tidak boleh kosong',
    }),
});

const galleriesUpdateSchema = Joi.object({
  gallery_name: Joi.string().required().messages({
    'string.empty': 'Name tidak boleh kosong',
  }),
  gallery_desc: Joi.string().required().messages({
    'string.empty': 'deskripsi tidak boleh kosong',
  }),
  gallery_business: Joi.string().required().messages({
    'string.empty': 'Bisnis tidak boleh kosong',
  }),
});

const querySchema = Joi.object({
    limit: Joi.number().integer().min(1).optional(),
    page: Joi.number().integer().min(1).optional(),
    keyword: Joi.string().trim().optional(),
    filter: Joi.object({
      gallery_name: Joi.alternatives()
        .try(Joi.string().trim(), Joi.array().items(Joi.string().trim()))
        .optional(),
    }).optional(),
    order: Joi.object()
      .pattern(Joi.string(), Joi.string().valid("asc", "desc", "ASC", "DESC"))
      .optional(),
});

const uuidSchema = Joi.object({
  gallery_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
});

const post_galleries = async (req, res) => {
    try {
        const { error, value } = galleriesSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
                data: null,
            });
        }
        const { gallery_name, gallery_desc, gallery_business } = value;

        const businessValid = await tbl_business.findOne({
            where: { business_uuid: gallery_business },
          });
          
        if (!businessValid) {
            return res.status(400).json({
            success: false,
            message: "Data tidak ditemukan",
            data: null,
            });
        }
        
        const gallery_uuid = uuidv4();
        const new_gallery = await tbl_galleries.create({
            gallery_uuid: gallery_uuid,
            gallery_name: gallery_name,
            gallery_desc: gallery_desc,
            gallery_business: gallery_business,
        });

        if (!new_gallery) {
            return res.status(404).json({
                success: false,
                message: "Gagal menambahkan data",
                data: null,
            });
        }

        const update_media = await tbl_media.findOne({
            where: { media_uuid: gallery_uuid },
        });


        if (update_media) {
            await update_media.update({
                media_uuid_table: gallery_uuid || update_media.media_uuid_table,
                media_table: "gallery" || update_media.media_table,
                gallery_update_at: new Date(),
            });
        }

        res.status(200).json({
            success: true,
            message: "Sukses menambah data",
            data: {
                gallery_uuid: new_gallery.gallery_uuid,
                gallery_name: new_gallery.gallery_name,
                gallery_desc: new_gallery.gallery_desc,
                gallery_business: new_gallery.gallery_business,
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

const put_galleries = async (req, res) => {
  try {
    const gallery_uuid = req.params.gallery_uuid;
    const { error, value } = galleriesUpdateSchema.validate(req.body);
  
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }
  
    const update_gallery = await tbl_galleries.findOne({
      where: { gallery_uuid },
    });
  
    if (!update_gallery) {
      return res.status(404).json({
        success: false,
        message: "Gagal merubah data",
        data: null,
      });
    }
  
    if (value.gallery_business && value.gallery_business !== update_gallery.gallery_business) {
      const existingGallery = await tbl_galleries.findOne({
        where: {
          gallery_business: value.gallery_business,
          gallery_uuid: { [Op.ne]: gallery_uuid },
          gallery_delete_at: null
        },
      });
  
      if (existingGallery) {
        return res.status(400).json({
          success: false,
          message: "Data Sudah di Gunakan",
          data: null,
        });
      }
    }
  
    await update_gallery.update({
      gallery_name: value.gallery_name || update_gallery.gallery_name,
      gallery_desc: value.gallery_desc || update_gallery.gallery_desc,
      gallery_business: value.gallery_business || update_gallery.gallery_business,
      gallery_update_at: new Date(),
    });
    
    res.status(200).json({
      success: true,
      message: "Berhasil merubah data",
      data: {
        gallery_uuid: update_gallery.gallery_uuid,
        gallery_name: update_gallery.gallery_name,
        gallery_desc: update_gallery.gallery_desc,
        gallery_business: update_gallery.gallery_business,
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

const delete_galleries = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { gallery_uuid } = value;

    const delete_gallery = await tbl_galleries.findOne({
      where: { gallery_uuid },
    });

    if (!delete_gallery) {
      return res.status(404).json({
        success: false,
        message: "Gagal menghapus data",
        data: null,
      });
    }

    await delete_gallery.update({ gallery_delete_at: new Date() });

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

const get_detail_galleries = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { gallery_uuid } = value;

    const detail_gallery = await tbl_galleries.findOne({
      where: {
        gallery_uuid,
        gallery_delete_at: null,
      },
      include: [
        {
          model: tbl_business,
          as: "gallery_business_as",
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

    if (!detail_gallery) {
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
        gallery_uuid: detail_gallery.gallery_uuid,
        gallery_name: detail_gallery.gallery_name,
        gallery_desc: detail_gallery.gallery_desc,
        gallery_business: detail_gallery.gallery_business_as
          ? {
              business_uuid: detail_gallery.gallery_business_as.business_uuid,
              business_name: detail_gallery.gallery_business_as.business_name,
              business_desc: detail_gallery.gallery_business_as.business_desc,
              business_province: detail_gallery.gallery_business_as.business_province,
              business_regency: detail_gallery.gallery_business_as.business_regency,
              business_subdistrict:
                detail_gallery.gallery_business_as.business_subdistrict,
              business_address: detail_gallery.gallery_business_as.business_address,
              business_customer: detail_gallery.gallery_business_as.business_customer,
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

const get_all_galleries = async (req, res) => {
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
          order = { gallery_id: "desc" },
        } = value;
    
        let offset = limit && page ? (page - 1) * limit : 0;
        const orderField = Object.keys(order)[0];
        const orderDirection =
          order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";
    
        const whereClause = {
          gallery_delete_at: null,
        };
    
        if (filter.gallery_name) {
          const filterNames = Array.isArray(filter.gallery_name)
            ? filter.gallery_name
            : filter.gallery_name.split(",");
    
          if (filterNames.length > 0) {
            whereClause.gallery_name = {
              [Sequelize.Op.or]: filterNames.map((name) => ({
                [Sequelize.Op.like]: `%${name.trim()}%`,
              })),
              [Sequelize.Op.not]: null,
            };
          } else {
            console.log("Empty filter.gallery_name");
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
    
          whereClause.gallery_name = whereClause.gallery_name
            ? { [Sequelize.Op.and]: [whereClause.gallery_name, keywordClause] }
            : keywordClause;
        }
    
        const data = await tbl_galleries.findAndCountAll({
          where: whereClause,
          order: [[orderField, orderDirection]],
          limit: limit ? parseInt(limit) : null,
          offset: offset ? parseInt(offset) : null,
          include: [
            {
              model: tbl_business,
              as: "gallery_business_as",
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
          data: data.rows.map((gallery) => ({
            gallery_uuid: gallery.gallery_uuid,
            gallery_name: gallery.gallery_name,
            gallery_desc: gallery.gallery_desc,
            gallery_business: gallery.gallery_business_as
              ? {
                  business_uuid: gallery.gallery_business_as.business_uuid,
                  business_name: gallery.gallery_business_as.business_name,
                  business_desc: gallery.gallery_business_as.business_desc,
                  business_province: gallery.gallery_business_as.business_province,
                  business_regency: gallery.gallery_business_as.business_regency,
                  business_subdistrict:
                    gallery.gallery_business_as.business_subdistrict,
                  business_address: gallery.gallery_business_as.business_address,
                  business_customer: gallery.gallery_business_as.business_customer,
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
        const excludePagesUrl = "http://localhost:9900/api/v1/gallery/get_all";
    
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

const get_unique_galleries = async (req, res) => {
};

const get_count_galleries = async (req, res) => {
};

const get_galleries_byGalleries = async (req, res) => {
};


module.exports = {
  post_galleries,
  put_galleries,
  delete_galleries,
  get_all_galleries,
  get_detail_galleries,
  get_unique_galleries,
  get_count_galleries,
  get_galleries_byGalleries
};
