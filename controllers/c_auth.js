const db = require("../models");
const tbl_user = db.tbl_user;
const tbl_customer = db.tbl_customer;
const tbl_media = db.tbl_media;
const bcrypt = require("bcrypt");
const Joi = require('joi');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require("uuid");
const saltRounds = 10;

const customerSchema = Joi.object({
    customer_username: Joi.string().required(),
    customer_full_name: Joi.string().required(),
    customer_email: Joi.string().email().required(),
    customer_password: Joi.string().min(8).required(), 
});

const Login = async (req, res) => {
  let uuidUser = null;
  let name_user = null;
  let email_user = null;
  try {
    const user = await tbl_customer.findOne({
      where: {
        customer_email: req.body.email,
      },
    });
    const user_admin = await tbl_user.findOne({
      where: {
        user_email: req.body.email,
      },
    });
    if (!user && !user_admin) {
      return res.status(404).json({ msg: "Akun Anda tidak terdaftar!" });
    } else if (user_admin) {
      const match = await bcrypt.compare(
        req.body.password,
        user_admin.user_password
      );
      if (!match)
        return res.status(400).json({ msg: "Password Admin Anda salah" });
      uuidUser = user_admin.user_uuid;
      name_user = user_admin.user_username;
      email_user = user_admin.user_email;
    } else if (user) {
      const match = await bcrypt.compare(
        req.body.password,
        user.customer_password
      );
      if (!match)
        return res.status(400).json({ msg: "Password User Anda salah" });
      uuidUser = user.customer_uuid;
      name_user = user.customer_username;
      email_user = user.customer_email;
    }
    req.session.userUuid = uuidUser;
    const name = name_user;
    const email = email_user;
    res.status(200).json({ name, email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Terjadi kesalahan pada server" });
  }
};

const Me = async (req, res) =>{
    if(!req.session.userUuid){
        return res.status(401).json({msg: "Mohon login ke akun Anda!"});
    }
    try {
        const user = await tbl_customer.findOne({
            attributes:['customer_username'],
            where: {
                customer_uuid: req.session.userUuid
            }
            });
            
            const user_admin = await tbl_user.findOne({
                attributes:['user_username'],
                where: {
                    user_uuid: req.session.userUuid
                }
            });
        if (!user && !user_admin) { 
            return res.status(404).json({ msg: "User tidak ditemukan" });
        } else if (user_admin) {
            const name = user_admin['user_username'];
            const level = 'admin';
            res.status(200).json({ name, level,});
        } else if (user) {
            const name = user['customer_username'];
            const level = 'customer';
            res.status(200).json({ name, level,});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
}


const registrasi_customer = async (req, res) => {
  try {
      const { error, value } = customerSchema.validate(req.body);
      if (error) {
          return res.status(400).json({
              success: false,
              message: error.details[0].message,
              data: null
          });
      }

      const {
          customer_username,
          customer_full_name,
          customer_email,
          customer_password,
      } = value;

      const existingCustomer = await tbl_customer.findOne({
          where: { 
              [Op.and]: [
                  { customer_email: customer_email },
                  { customer_delete_at: null }
                  
              ]
          }
        });
    
        if (existingCustomer) {
          return res.status(400).json({
            success: false,
            message: "Email sudah digunakan, silakan gunakan email lain.",
            data: existingCustomer,
          });
        }
  
      const customer_uuid = uuidv4();
      
      const hashedPassword = await bcrypt.hash(customer_password, saltRounds);

      const create_customer = await tbl_customer.create({
          customer_uuid: customer_uuid,
          customer_username: customer_username,
          customer_full_name: customer_full_name,
          customer_email: customer_email,
          customer_password: hashedPassword,
      });
  
      if (!create_customer) {
          return res.status(404).json({
              success: false,
              message: 'Gagal menambahkan data pelanggan',
              data: null
          });
      }

      const create_media = await tbl_media.create({
          media_uuid_table: create_customer.customer_uuid,
          media_table: 'customer'
      });

      if (!create_media) {
          return res.status(404).json({
              success: false,
              message: 'Anda Gagal melakukan registrasi',
              data: null
          });
      }

      res.status(200).json({
          success: true,
          message: 'Registrasi Berhasil',
          data: {
              customer_uuid: create_customer.customer_uuid,
              customer_username: create_customer.customer_username,
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


const logOut = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(400).json({ msg: "Tidak dapat logout" });
    res.status(200).json({ msg: "Anda telah logout" });
  });
};

module.exports = { Login, registrasi_customer, logOut, Me };
