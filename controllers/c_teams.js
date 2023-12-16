const db = require("../models");
const tbl_business = db.tbl_business;
const tbl_teams = db.tbl_teams;
const tbl_media = db.tbl_media;
const tbl_scopes = db.tbl_scopes;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const Joi = require("joi");
const { Op } = require("sequelize");

const teamsSchema = Joi.object({
    team_name: Joi.string().required(),
    team_job_desc: Joi.string().required(),
    // team_media: Joi.string().guid({ version: "uuidv4" }).required(),
  });

  const post_teams = async (req, res) => {
    try {
        // Validasi data team
        const { error, value } = teamsSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
                data: null,
            });
        }

        // Ekstrak data team
        const { team_name, team_job_desc } = value;
        const customerUuid = req.session.userUuid;

        // Cari bisnis terkait dengan customer
        const businesses = await tbl_business.findAll({
            where: { business_customer: customerUuid }
        });

        // Cari scope terkait dengan customer (Tambahkan ini)
        const scopes = await tbl_scopes.findAll({
            where: { scope_business: customerUuid }
        });

        // Jika tidak ada bisnis, kirim error
        if (!businesses || businesses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Bisnis tidak ditemukan untuk customer ini",
                data: null
            });
        }

        // Pilih bisnis yang akan digunakan
        let businessToUse = null;
        for (const business of businesses) {
            const existingTeam = await tbl_teams.findOne({
                where: {
                    team_business: business.business_uuid,
                    team_delete_at: null,
                }
            });

            if (!existingTeam) {
                businessToUse = business;
                break;
            }
        }

        // Jika tidak ada bisnis yang tersedia, kirim error
        if (!businessToUse) {
            return res.status(404).json({
                success: false,
                message: "Tidak ada business_uuid yang tersedia untuk digunakan",
                data: null
            });
        }

        // Pilih scope yang akan digunakan (Tambahkan ini)
        let scopeToUse = null;
        if (scopes && scopes.length > 0) {
            // Logika pemilihan scope bisa disesuaikan di sini
            scopeToUse = scopes[0]; // Contoh: menggunakan scope pertama
        }

        // Buat UUID untuk team baru
        const team_uuid = uuidv4();

        // Buat data team baru
        const new_teams = await tbl_teams.create({
            team_uuid: team_uuid,
            team_name: team_name,
            team_job_desc: team_job_desc,
            team_business: businessToUse.business_uuid,
            team_scope: scopeToUse ? scopeToUse.scope_uuid : null // Tambahkan scope UUID
        });

        // Jika gagal menambahkan team, kirim error
        if (!new_teams) {
            return res.status(404).json({
                success: false,
                message: "Gagal menambahkan data",
                data: null,
            });
        }

        // Kirim respons sukses
        res.status(200).json({
            success: true,
            message: "Sukses menambah data",
            data: {
                team_uuid: new_teams.team_uuid,
                team_name: new_teams.team_name,
                team_desc: new_teams.team_desc,
                team_business: new_teams.team_business,
                team_scope: new_teams.team_scope // Tambahkan ini
            },
        });
    } catch (error) {
        console.log(error, 'Data Error')
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            data: null,
        });
    }
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
