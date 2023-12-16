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
    team_scope: Joi.string().required(),
    team_media: Joi.string().guid({ version: "uuidv4" }).required(),
});

const querySchema = Joi.object({
    limit: Joi.number().integer().min(1).optional(),
    page: Joi.number().integer().min(1).optional(),
    keyword: Joi.string().trim().optional(),
    filter: Joi.object({
        team_name: Joi.alternatives().try(
            Joi.string().trim(),
            Joi.array().items(Joi.string().trim())
        ).optional()
    }).optional(),
    order: Joi.object().pattern(
        Joi.string(), Joi.string().valid('asc', 'desc', 'ASC', 'DESC')
    ).optional()
});

const post_teams = async (req, res) => {
    try {
        const { error, value } = teamsSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
                data: null,
            });
        }

        const { team_name, team_job_desc, team_scope, team_media } = value;

        const scopesValid = await tbl_scopes.findOne({
            where: { scope_uuid: team_scope }
        });

        if (!scopesValid) {
            return res.status(400).json({
                success: false,
                message: 'Data Scope Tidak Di Temukan',
                data: null
            })
        }

        const existingTeams = await tbl_teams.findOne({
            where: { team_scope: team_scope, team_delete_at: null }
        })

        if (existingTeams) {
            return res.status(400).json({
                success: false,
                message: 'Data Scope sudah di gunakan',
                data: null
            })
        }
        
        const team_uuid = uuidv4();

        const new_teams = await tbl_teams.create({
            team_uuid: team_uuid,
            team_name: team_name,
            team_job_desc: team_job_desc,
            team_scope: team_scope,
            team_media: team_media,
        });

        if (!new_teams) {
            return res.status(404).json({
                success: false,
                message: "Gagal menambahkan data",
                data: null,
            });
        }

        const update_media = await tbl_media.findOne({
            where: {
              media_uuid : team_media
            },
        });

        if (!update_media) {
            return res.status(404).json({
                success: false,
                message: "Team tidak ditemukan",
                data: null
            });
        } else {
            await update_media.update({
                media_uuid_table: team_uuid || update_media.media_uuid_table,
                media_table: "teams" || update_media.media_table,
                team_update_at: new Date()
            })
        }

        res.status(200).json({
            success: true,
            message: "Sukses menambah data",
            data: {
                team_uuid: new_teams.team_uuid,
                team_name: new_teams.team_name,
                team_desc: new_teams.team_desc,
                team_scope: new_teams.team_scope
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
                order = { team_id: 'desc' }
            } = value;
    
            let offset = limit && page ? (page - 1) * limit : 0;
            const orderField = Object.keys(order)[0];
            const orderDirection = order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";
    
            const whereClause = {
                team_delete_at: null,
            }
    
            if (filter.team_name) {
                const filterNames = Array.isArray(filter.team_name)
                ? filter.team_name
                : filter.team_name.split(',');
    
                if (filterNames.length > 0) {
                    whereClause.team_name = {
                      [Sequelize.Op.or]: filterNames.map(name => ({
                        [Sequelize.Op.like]: `%${name.trim()}%`,
                      })),
                      [Sequelize.Op.not]: null,
                    };
                  } else {
                    console.log("Empty filter.business_name");
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
          
                whereClause.team_name = whereClause.team_name
                  ? { [Sequelize.Op.and]: [whereClause.team_name, keywordClause] }
                  : keywordClause;
            }
    
            const data = await tbl_teams.findAndCountAll({
                where: whereClause,
                order: [[orderField, orderDirection]],
                limit: limit ? parseInt(limit) : null,
                offset: offset ? parseInt(offset) : null,
                include: [
                  {
                    model: tbl_scopes,
                    as: 'team_scope_as',
                    attributes: ['scope_uuid', 'scope_name', 'scope_desc', 'scope_business'],
                  },
                ]
              });
              
              const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;
    
              const result = {
                success: true,
                message: "Sukses mendapatkan data",
                data: data.rows.map((teams) => ({
                    team_uuid: teams.team_uuid,
                    team_name: teams.team_name,
                    team_job_desc: teams.team_job_desc,
                    team_scope: teams.team_scope_as
                    ? {
                      scope_uuid: teams.team_scope_as.scope_uuid,
                      scope_name: teams.team_scope_as.scope_name,
                      scope_desc: teams.team_scope_as.scope_desc,
                      scope_business: teams.team_scope_as.scope_business,
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
              const excludePagesUrl = "http://localhost:9900/api/v1/teams/get_all";
          
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
