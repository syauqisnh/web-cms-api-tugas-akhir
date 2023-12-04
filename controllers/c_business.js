const db = require("../models");
const tbl_business = db.tbl_business;
const tbl_customer = db.tbl_customer;
const tbl_media = db.tbl_media;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const Joi = require("joi");
const { Op } = require("sequelize");

const businessSchema = Joi.object({
  business_name: Joi.string().required(),
  business_desc: Joi.string().required(),
  business_province: Joi.string().required(),
  business_regency: Joi.string().required(),
  business_subdistrict: Joi.string().required(),
  business_address: Joi.string().required(),
  business_notelp: Joi.string().min(10).max(14).required(),
  business_email: Joi.string().email().required(),
  business_link_wa: Joi.string().required(),
  // business_media: Joi.string().required(),
});

// const updateBusinessSchema = Joi.object({
//   business_name: Joi.string(),
//   business_desc: Joi.string(),
//   business_province: Joi.string(),
//   business_regency: Joi.string(),
//   business_subdistrict: Joi.string(),
//   business_address: Joi.string(),
//   business_notelp: Joi.string().min(10).max(14),
//   business_email: Joi.string().email(),
//   business_link_wa: Joi.string(),
//   business_media: Joi.string().required(),
// });

const uuidSchema = Joi.object({
  business_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
});

// Untuk CREATE Datanya
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

    // Ambil ID customer dari sesi atau token
    const customerId = req.session.userUuid;

    // Cek apakah ID customer tersebut ada
    const customer = await tbl_customer.findOne({
      where: { customer_uuid: customerId },
    });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer tidak ditemukan.",
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

    const existingBusiness = await tbl_business.findOne({
      where: {
        [Op.or]: [
          { business_email: business_email },
          { business_notelp: business_notelp },
        ],
        business_delete_at: null,
      },
    });

    if (existingBusiness) {
      return res.status(400).json({
        success: false,
        message: "Data sudah digunakan, silakan gunakan email lain.",
        data: existingBusiness,
      });
    }

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
      business_customer: customerId,
    });

    if (!create_business) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data bisnis",
        data: null,
      });
    }

    const create_media = await tbl_media.create({
      media_uuid_table: create_business.business_uuid,
      media_table: "business",
    });

    if (!create_media) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data media",
        data: null,
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

// Untuk Edit Datanya (Perbaikan)
const put_business = async (req, res) => {};

// Untuk Delete Datanya
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
        message: "Gagal menghapus data pelanggan",
        data: null,
      });
    }

    await delete_business.update({ business_delete_at: new Date() });

    await tbl_media.update(
      { media_delete_at: new Date() },
      { where: { media_uuid_table: business_uuid, media_table: "business" } }
    );

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

// Untuk Menampilkan datanya berdasarkan UUID
const get_detail_business = async (req, res) => {
  try {
    const { error, value } = uuidSchema.validate(req.params);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
            data: null
        });
    }

    const { business_uuid } = value;

    const detail_business = await tbl_business.findOne({
        where: {
            business_uuid,
            business_delete_at: null
        }
    });

    if (!detail_business) {
        return res.status(404).json({
            success: false,
            message: 'Gagal Mendapatkan Data',
            data: null
        });
    }

    const result = {
        success: true,
        message: 'Berhasil Mendapatkan Data',
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
        }
    };

    res.status(200).json(result);
} catch (error) {
    console.log(error, 'Data Error');
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        data: null
    });
}
};

// Untuk Menampilkan Seluruh Datanya(perbaikan)
const get_all_business = async (req, res) => {};

// Untuk mendapatkan Data yang uniqe
const get_uniqe_business = async (req, res) => {};

const get_count_business = async (req, res) => {};

module.exports = {
  post_business,
  put_business,
  delete_business,
  get_all_business,
  get_detail_business,
  get_uniqe_business,
  get_count_business,
};
