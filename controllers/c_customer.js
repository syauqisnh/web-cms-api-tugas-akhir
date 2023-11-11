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

module.exports = {
    post_customer,
    put_customer,
    delete_customer
}