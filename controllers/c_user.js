const db = require("../models");
const tbl_user = db.tbl_user;
const tbl_media = db.tbl_media;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const post_user = async (req, res) => {
  try {
    const {
      user_username,
      user_full_name,
      user_nohp,
      user_address,
      user_email,
      user_password,
    } = req.body;

    if (!user_username || !user_full_name || !user_email || !user_password) {
      return res.status(400).json({
        success: false,
        message: "Belum ada data yang di isi",
        data: null,
      });
    }

    const user_uuid = uuidv4();

    const hashedPassword = await bcrypt.hash(user_password, saltRounds);

    const create_user = await tbl_user.create({
      user_uuid: user_uuid,
      user_username: user_username,
      user_full_name: user_full_name,
      user_nohp: user_nohp,
      user_address: user_address,
      user_email: user_email,
      user_password: hashedPassword,
    });

    if (!create_user) {
      return res.status(404).json({
        success: false,
        message: "Gagal menambahkan data user",
        data: null,
      });
    }

    const create_media = await tbl_media.create({
      media_uuid_table: create_user.user_uuid,
      media_table: "user",
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
      message: "Berhasil menambahkan data user",
      data: {
        user_username: create_user.user_username,
        user_full_name: create_user.user_full_name,
        user_nohp: create_user.user_nohp,
        user_address: create_user.user_address,
        user_email: create_user.user_email,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
  }
};

const put_user = async (req, res) => {
  try {
    const { user_uuid } = req.params;
    const {
      user_username,
      user_full_name,
      user_nohp,
      user_address,
      user_email,
      user_password,
    } = req.body;

    if (!user_username || !user_full_name || !user_email || !user_password) {
      return res.status(400).json({
        success: false,
        message: "Data harus di isi",
        data: null,
      });
    }

    const user_update = await tbl_user.findOne({
      where: {
        user_uuid,
      }
    });

    if (!user_update) {
      return res.status(404).json({
        success: false,
        message: "Gagal mengedit data",
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(user_password, saltRounds);

    user_update.user_username = user_username
    user_update.user_full_name = user_full_name
    user_update.user_nohp = user_nohp
    user_update.user_address = user_address
    user_update.user_email = user_email
    user_update.user_password = hashedPassword
    user_update.user_update_at = new Date();

    await user_update.save();

    res.status(200).json({
      success: true,
      message: "Sukses mengedit data",
      data: {
        user_username: user_update.user_username,
        user_full_name: user_update.user_full_name,
        user_nohp: user_update.user_nohp,
        user_address: user_update.user_address,
        user_email: user_update.user_email,
        user_create_at: user_update.user_create_at,
        user_update_at : user_update.user_update_at,
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

const delete_user = async (req, res) => {
    try {
        const {user_uuid} = req.params;

        const delete_user = await tbl_user.findOne({
            where: {
                user_uuid
            },
        });

        if (!delete_user) {
            return res.status(404).json({
                success: false,
                message: 'Gagal menghapus data user',
                data: null
            });
        }

        await delete_user.update({ user_delete_at: new Date() });

        await tbl_media.update(
            { media_delete_at: new Date() },
            { where: { media_uuid_table: user_uuid, media_table: 'user' } }
        );

        res.json({
            success: true,
            message: "Sukses menghapus data user dan data media terkait",
        });

    } catch (error) {
        console.log(error, 'Data Error');
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            data: null
        });
    }
};

const get_detail_user = async (req, res) => {
    try {
        const {user_uuid} = req.params;

        const detail_user = await tbl_user.findOne({
            where: {
                user_uuid,
                user_delete_at: null
            }
        })

        if (!detail_user) {
            return res.status(404).json({
                success: false,
                message: 'Gagal Mendapatkan Data',
                data: null
            })
        }

        const result = {
            success: true,
            message: 'Berhasil Mendapatakan Data',
            data: {
                user_username: detail_user.user_username,
                user_full_name: detail_user.user_full_name,
                user_nohp: detail_user.user_nohp,
                user_address: detail_user.user_address,
                user_email: detail_user.user_email,
            }
        }

        res.status(200).json(result)
    } catch (error) {
        console.log(error, 'Data Error')
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            data: null
        })
    }
};

const get_all_user = async (req, res) => {
    try {
        const {
            limit = null,
            page = null,
            keyword = '',
            filter = {},
            order = {user_id: 'desc'}
        } = req.query;

        let offset = limit && page ? (page - 1) * limit : 0;
        const orderField = Object.keys(order)[0];
        const orderDirection = order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

        const whereClause = {
            user_delete_at: null,
        }

        if (filter.user_username) {
            const filterNames = Array.isArray(filter.user_username)
            ? filter.user_username
            : filter.user_username.split(',');

            if (filterNames.length > 0) {
                whereClause.user_username = {
                  [Sequelize.Op.or]: filterNames.map(name => ({
                    [Sequelize.Op.like]: `%${name.trim()}%`,
                  })),
                  [Sequelize.Op.not]: null,
                };
              } else {
                console.log("Empty filter.user_name");
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
      
            whereClause.user_username = whereClause.user_username
              ? { [Sequelize.Op.and]: [whereClause.user_username, keywordClause] }
              : keywordClause;
        }

        const data = await tbl_user.findAndCountAll({
            where: whereClause,
            order: [[orderField, orderDirection]],
            limit: limit ? parseInt(limit) : null,
            offset: offset ? parseInt(offset) : null,
          });
          
          const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

          const result = {
            success: true,
            message: "Sukses mendapatkan data",
            data: data.rows.map((user) => ({
                user_username: user.user_username,
                user_full_name: user.user_full_name,
                user_nohp: user.user_nohp,
                user_address: user.user_address,
                user_email: user.user_email,
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
          const excludePagesUrl = "http://localhost:9900/api/v1/user/get_all";
      
          if (currentUrl === excludePagesUrl) {
            delete result.pages
          }
      
          res.status(200).json(result);
    } catch (error) {
        console.log(error, 'Data Error')
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            data: null
        })
    }
};

const get_uniqe_user = async (req, res) => {
    try {
        const {field} = req.query;

        if (!field) {
            return res.status(400).json({
                success: false,
                message: 'Parameter FIELD harus di isikan',
                data: null
            })
        }
    
        const fieldsArray = field.split(',');
        const tableAttributes = tbl_user.rawAttributes;
        const invalidFields = fieldsArray.filter((f) => !(f in tableAttributes));
    
        if (invalidFields.length > 0) {
            return res.status(200).json({
                success: false,
                message: 'Gagal mendapatkan data',
                data: null
            })
        }

        const uniqeValues = {};

        for (const f of fieldsArray) {
            const values = await tbl_user.findAll({
                attributes: [[Sequelize.fn('DISTINCT', Sequelize.col(f)), f]],
                where: {
                    user_delete_at: null,
                }
            });

            if (values && values.length > 0) {
                uniqeValues[f] = values.map((item) => item[f]);
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Sukses mendapatkan data',
            data: uniqeValues,
        })
    } catch (error) {
        console.log(error, 'Data Error');
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            data: null
        })
    }
};

const get_count_user = async (req, res) => {
    try {
        const {field} = req.query;
    
        if (!field || typeof field !== 'object') {
          return res.status(400).json({
            success: false,
            message: 'Parameter field harus berupa objek',
            data: null,
          });
        }
    
        const counts = {};
    
        for (const fieldName in field) {
          if (field.hasOwnProperty(fieldName)) {
            const values = Array.isArray(field[fieldName])
              ? field[fieldName]
              : field[fieldName].split(',').map((val) => val.trim());
    
            const valueCounts = {}; 
    
            for (const value of values) {
              const count = await tbl_user.count({
                where: {
                  [fieldName]: {
                    [Sequelize.Op.not]: null,
                    [Sequelize.Op.eq]: value,
                  },
                  user_delete_at: null
                },
              });
              valueCounts[value] = count;
            }
    
            counts[fieldName] = Object.keys(valueCounts).map((value) => ({
              value,
              count: valueCounts[value],
            }));
          }
        }
    
        const response = {
          success: true,
          message: 'Sukses mendapatkan data',
          data: counts,
        };
    
        return res.status(200).json(response);
      } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          data: null,
        });
      }
};

module.exports = {
  post_user,
  put_user,
  delete_user,
  get_detail_user,
  get_all_user,
  get_uniqe_user,
  get_count_user,
};
