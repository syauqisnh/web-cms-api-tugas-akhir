const db = require("../models");
const tbl_user = db.tbl_user;
const tbl_customer = db.tbl_customer;
const bcrypt = require("bcrypt");

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
      return res.status(404).json({ msg: "User tidak ditemukan" });
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

const logOut = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(400).json({ msg: "Tidak dapat logout" });
    res.status(200).json({ msg: "Anda telah logout" });
  });
};

module.exports = { Login, logOut, Me };
