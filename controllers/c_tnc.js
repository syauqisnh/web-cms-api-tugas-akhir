const db = require("../models");
const tbl_tnc = db.tbl_tnc;
const tbl_business = db.tbl_business;
const tbl_price_list = db.tbl_price_list;
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");

const post_tnc = async (req, res) => {};

const put_tnc = async (req, res) => {};

const delete_tnc = async (req, res) => {};

const get_detail_tnc = async (req, res) => {};

const get_all_tnc = async (req, res) => {};

const get_uniqe_tnc = async (req, res) => {};

const get_count_tnc = async (req, res) => {};

const get_tnc_byBusiness = async (req, res) => {};

module.exports = {
  post_tnc,
  put_tnc,
  delete_tnc,
  get_all_tnc,
  get_detail_tnc,
  get_uniqe_tnc,
  get_count_tnc,
  get_tnc_byBusiness,
};
