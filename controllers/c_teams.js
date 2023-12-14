const db = require("../models");
const tbl_business = db.tbl_business;
const tbl_teams = db.tbl_teams;
const tbl_media = db.tbl_media;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
// const Joi = require("joi");
// const { Op } = require("sequelize");

// const teamsSchema = Joi.object({
//     team_name: Joi.string().required(),
//     team_job_desc: Joi.string().required(),
//     team_scope: Joi.string().required(),
//     team_business: Joi.string().required(),
//     team_media: Joi.string().guid({ version: "uuidv4" }).required(),
//   });

const post_teams = async (req, res) => {

};

const put_teams = async (req, res) => {
};

const delete_teams = async (req, res) => {
};

const get_detail_teams = async (req, res) => {
};

const get_all_teams = async (req, res) => {
};

const get_uniqe_teams = async (req, res) => {
};

const get_count_teams = async (req, res) => {
};

module.exports = {
    post_teams,
    put_teams,
    delete_teams,
    get_detail_teams,
    get_all_teams,
    get_uniqe_teams,
    get_count_teams
};
