const db = require('../models');
const tbl_customer = db.tbl_customer;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const post_customer = async (req, res) => {
    try {
        const {
            customer_username,
            customer_full_name,
            customer_nohp,  
            customer_address,
            customer_email,
            customer_password,
        } = req.body;
    
        if (!customer_username || !customer_full_name || !customer_nohp || !customer_address 
            || !customer_email || !customer_password) {
            return res.status(400).json({
                success: false,
                message: 'Belum ada data yang diisi',
                data: null
            });
        }
    
        const customer_uuid = uuidv4();
        
        const hashedPassword = await bcrypt.hash(customer_password, saltRounds);

        const create_customer = await tbl_customer.create({
            customer_uuid: customer_uuid,
            customer_username: customer_username,
            customer_full_name: customer_full_name,
            customer_nohp: customer_nohp,
            customer_address: customer_address,
            customer_email: customer_email,
            customer_password: hashedPassword,
        });
    
        if (!create_customer) {
            return res.status(404).json({
                success: false,
                message: 'Gagal menambahkan data',
                data: null
            });
        }

        res.status(200).json({
            success: true,
            message: 'Berhasil menambahkan data',
            data: {
                customer_uuid: create_customer.customer_uuid,
                customer_username: create_customer.customer_username,
                customer_full_name: create_customer.customer_full_name,
                customer_nohp: create_customer.customer_nohp,
                customer_address: create_customer.customer_address,
                customer_email: create_customer.customer_email
            }
        });
    } catch (error) {
        console.log(error, 'Data Error');
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            data: null
        });
    }
}

const put_customer = async (req, res) =>  {
    try {
        const {customer_uuid} = req.params;
        const {
            customer_username,
            customer_full_name,
            customer_nohp,  
            customer_address,
            customer_email,
            customer_password,
        } = req.body;

        if (!customer_username || !customer_full_name || !customer_nohp 
            || !customer_address || !customer_email || !customer_password) {
            return res.status(400).json({
                success: false,
                message: 'Data harus di isi',
                data: null
            })
        }

        const update_customer = await tbl_customer.findOne({
            where: {
                customer_uuid
            }
        })

        if (!update_customer) {
            return res.status(404).json({
                success: false,
                message: 'Gagal merubah data',
                data: null
            })
        }

        const hashedPassword = await bcrypt.hash(customer_password, saltRounds);

        update_customer.customer_username = customer_username
        update_customer.customer_full_name = customer_full_name
        update_customer.customer_nohp = customer_nohp
        update_customer.customer_address = customer_address
        update_customer.customer_email = customer_email
        update_customer.customer_password = hashedPassword
        update_customer.customer_update_at = new Date();

        await update_customer.save();

        res.status(200).json({
            success: true,
            message: 'Berhasil merubah data',
            data: {
                customer_username: update_customer.customer_username,
                customer_full_name: update_customer.customer_full_name,
                customer_nohp: update_customer.customer_nohp,
                customer_address: update_customer.customer_address,
                customer_email: update_customer.customer_email,
                customer_create_at: update_customer.customer_create_at,
                customer_update_at : update_customer.customer_update_at,
            }
        })
    } catch (error) {
        console.log(error, 'Data Error')
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            data: null
        })
    }
}

const delete_customer = async (req, res) => {
    try {
        const {customer_uuid} = req.params;

        const delete_customer = await tbl_customer.findOne({
            where: {
                customer_uuid
            }
        })

        if (!delete_customer) {
            return res.status(404).json({
                success: false,
                message: 'Gagal menghapus data',
                data: null
            })
        }
        await delete_customer.update({ customer_delete_at: new Date() });

        res.json({
            success: true,
            message: "Sukses menghapus data",
        });

    } catch (error) {
        console.log(error, 'Data Error')
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            data: null
        })
    }
}

const get_detail_customer = async (req, res) => {
    try {
        const {customer_uuid} = req.params;

        const detail_customer = await tbl_customer.findOne({
            where: {
                customer_uuid,
                customer_delete_at: null
            }
        })

        if (!detail_customer) {
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
                customer_username: detail_customer.customer_username,
                customer_full_name: detail_customer.customer_full_name,
                customer_nohp: detail_customer.customer_nohp,
                customer_address: detail_customer.customer_address,
                customer_email: detail_customer.customer_email,
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
}

const get_all_customer = async (req, res) => {
    try {
        const {
            limit = null,
            page = null,
            keyword = '',
            filter = {},
            order = {customer_id: 'desc'}
        } = req.query;

        let offset = limit && page ? (page - 1) * limit : 0;
        const orderField = Object.keys(order)[0];
        const orderDirection = order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

        const whereClause = {
            customer_delete_at: null,
        }

        if (filter.customer_username) {
            const filterNames = Array.isArray(filter.customer_username)
            ? filter.customer_username
            : filter.customer_username.split(',');

            if (filterNames.length > 0) {
                whereClause.customer_username = {
                  [Sequelize.Op.or]: filterNames.map(name => ({
                    [Sequelize.Op.like]: `%${name.trim()}%`,
                  })),
                  [Sequelize.Op.not]: null,
                };
              } else {
                console.log("Empty filter.customer_name");
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
      
            whereClause.customer_username = whereClause.customer_username
              ? { [Sequelize.Op.and]: [whereClause.customer_username, keywordClause] }
              : keywordClause;
        }

        const data = await tbl_customer.findAndCountAll({
            where: whereClause,
            order: [[orderField, orderDirection]],
            limit: limit ? parseInt(limit) : null,
            offset: offset ? parseInt(offset) : null,
          });
          
          const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

          const result = {
            success: true,
            message: "Sukses mendapatkan data",
            data: data.rows.map((customer) => ({
                customer_username: customer.customer_username,
                customer_full_name: customer.customer_full_name,
                customer_nohp: customer.customer_nohp,
                customer_address: customer.customer_address,
                customer_email: customer.customer_email,
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
          const excludePagesUrl = "http://localhost:9900/api/v1/customer/get_all";
      
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
}

const get_uniqe_customer = async (req, res) => {
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
        const tableAttributes = tbl_customer.rawAttributes;
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
            const values = await tbl_customer.findAll({
                attributes: [[Sequelize.fn('DISTINCT', Sequelize.col(f)), f]],
                where: {
                    customer_delete_at: null,
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
}

const get_count_customer = async (req, res) => {
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
              const count = await tbl_customer.count({
                where: {
                  [fieldName]: {
                    [Sequelize.Op.not]: null,
                    [Sequelize.Op.eq]: value,
                  },
                  customer_delete_at: null
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
}

module.exports = {
    post_customer,
    put_customer,
    delete_customer,
    get_detail_customer,
    get_all_customer,
    get_uniqe_customer,
    get_count_customer,
}