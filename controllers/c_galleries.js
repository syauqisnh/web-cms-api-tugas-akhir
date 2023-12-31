const db = require("../models");
const tbl_galleries = db.tbl_galleries;
const tbl_media = db.tbl_media;
const tbl_business = db.tbl_business;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const Joi = require("joi");

const galleriesSchema = Joi.object({
    gallery_name: Joi.string().required(),
    gallery_desc: Joi.string().required(),
    gallery_business: Joi.string().required(),
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

        const existingGallery = await tbl_galleries.findOne({
            where: { gallery_business: gallery_business, gallery_delete_at: null },
          });
      
          if (existingGallery) {
            return res.status(400).json({
              success: false,
              message: "Data sudah digunakan",
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
};

const delete_galleries = async (req, res) => {
};

const get_detail_galleries = async (req, res) => {
};

const get_all_galleries = async (req, res) => {
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
