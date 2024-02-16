const db = require("../models");
const tbl_user = db.tbl_user;
const tbl_customer = db.tbl_customer;
const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) =>{
    let uuid;
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ msg: "Mohon login ke akun Anda!" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        uuid = decoded.uuid;

        const user = await tbl_customer.findOne({
            where: {
                customer_uuid: uuid
            }
        });

        const user_admin = await tbl_user.findOne({
            where: {
                user_uuid: uuid
            }
        });

        if (!user && !user_admin) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        req.userUuid = uuid;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
}

const adminOnly = async (req, res, next) =>{
    let uuid
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({msg: "Mohon login ke akun Anda!"});
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        uuid = decoded.uuid;
        const user = await tbl_user.findOne({
            where: {
                user_uuid: uuid
            }
        });

        if (!user) {
            return res.status(403).json({ msg: "Akses ditolak!!" });
        }
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
}

const authToken = async (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) {
        return res.status(401).json({
            message: 'Token anda tidak ditemukan'
        })
    } else {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(401).json({
                    message: 'Token salah atau kadaluarsa'
                })
            } else {
                req.user = {
                    uuid: user.uuid,
                    email: user.email,
                    password: user.password
                };
            }
            console.log("USERRRRR", req.user)
            next()
        })
    }
}

module.exports = { authenticate, adminOnly, authToken };
