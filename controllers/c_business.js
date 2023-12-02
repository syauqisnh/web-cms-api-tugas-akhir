const db = require("../models");
const tbl_business = db.tbl_business;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");

// Untuk CREATE Datanya
const post_business = async (req, res) => {
};

// Untuk Edit Datanya (Perbaikan)
const put_business = async (req, res) => {
}

// Untuk Delete Datanya
const delete_business = async (req, res) => {
};

// Untuk Menampilkan datanya berdasarkan UUID
const get_detail_business = async (req, res) => {
};

// Untuk Menampilkan Seluruh Datanya(perbaikan)
const get_all_business = async (req, res) => {
};

// Untuk mendapatkan Data yang uniqe
const get_uniqe_business = async (req, res) => {
};

const get_count_business = async (req, res) => {
};

module.exports = {
  post_business,
  put_business,
  delete_business,
  get_all_business,
  get_detail_business,
  get_uniqe_business,
  get_count_business,
};
