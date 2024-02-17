const db = require("../models");
const tbl_payments_via = db.tbl_payments_via;
const tbl_payments = db.tbl_payments;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const Joi = require("joi");

const schemaPaymentsVia = Joi.object({
  payment_via_name: Joi.string().required(),
});

const post_payment_via = async (req, res) => {
  try {
    const { error, value } = schemaPaymentsVia.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const { payment_via_name } = value

    const payment_via_uuid = uuidv4();

    const createPaymentVia = await tbl_payments_via.create({
        payment_via_uuid: payment_via_uuid,
        payment_via_name: payment_via_name
    });

    if (!createPaymentVia) {
        res.status(400).json({
            success: false,
            message: "Gagal menambahkan data",
            data: null,
        })
    }

    res.status(200).json({
        success: true,
        message: "Sukses menambahkan data",
        data: {
            payment_via_uuid: createPaymentVia.payment_via_uuid,
            payment_via_name: createPaymentVia.payment_via_name
        }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
    console.log("Data :", error);
  }
};

const put_payment_via = async (req, res) => {
  try {
  } catch (error) {}
};

const delete_payment_via = async (req, res) => {
  try {
  } catch (error) {}
};

const get_detail_payment_via = async (req, res) => {
  try {
  } catch (error) {}
};

const get_all_payment_via = async (req, res) => {
  try {
  } catch (error) {}
};

const get_unique_payment_via = async (req, res) => {
  try {
  } catch (error) {}
};

const get_count_payment_via = async (req, res) => {
  try {
  } catch (error) {}
};

module.exports = {
  post_payment_via,
  put_payment_via,
  delete_payment_via,
  get_detail_payment_via,
  get_all_payment_via,
  get_unique_payment_via,
  get_count_payment_via,
};
