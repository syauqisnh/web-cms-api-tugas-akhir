const db = require("../models");
const tbl_price_list = db.tbl_price_list;
const tbl_business = db.tbl_business;
const tbl_media = db.tbl_media;
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");

const priceSchema = Joi.object({
  price_list_name: Joi.string().required(),
  price_list_price: Joi.string().required(),
  price_list_desc: Joi.string().required(),
  price_list_status: Joi.string().valid("Y", "N").default("N").required(),
  price_list_order: Joi.string().required(),
  price_list_business: Joi.string().required(),
  // price_list_media: Joi.string().required(),
});

const priceSchemaUpdate = Joi.object({
  price_list_name: Joi.string().required(),
  price_list_price: Joi.string().required(),
  price_list_desc: Joi.string().required(),
  price_list_status: Joi.string().valid("Y", "N").default("N").required(),
  price_list_order: Joi.string().required(),
  price_list_business: Joi.string().required(),
});

const uuidSchema = Joi.object({
    price_list_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
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

    const existingPrice = await tbl_price_list.findOne({
      where: {
        price_list_business: price_list_business,
        price_list_delete_at: null,
      },
    });

    if (existingPrice) {
      return res.status(400).json({
        success: false,
        message: "Data sudah digunakan",
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

    res.status(200).json({
      success: true,
      message: "Sukses menambahkan data",
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

    if (value.price_list_business && value.price_list_business !== update_price_list.price_list_business) {
        const existingPrice = await tbl_price_list.findOne({
          where: {
            price_list_business: value.price_list_business,
            price_list_uuid: { [Op.ne]: price_list_uuid },
            price_list_delete_at: null
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
        price_list_name: value.price_list_name|| update_price_list.price_list_name,
        price_list_price: value.price_list_price || update_price_list.price_list_price,
        price_list_desc: value.price_list_desc || update_price_list.price_list_desc,
        price_list_status: value.price_list_status || update_price_list.price_list_status,
        price_list_order: value.price_list_order || update_price_list.price_list_order,
        price_list_business: value.price_list_business || update_price_list.price_list_business,
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
  } catch (error) {}
};

const get_all_price_list = async (req, res) => {
  try {
  } catch (error) {}
};

const get_uniqe_price_list = async (req, res) => {
  try {
  } catch (error) {}
};

const get_count_price_list = async (req, res) => {
  try {
  } catch (error) {}
};

const get_price_byBusiness = async (req, res) => {
  try {
  } catch (error) {}
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
