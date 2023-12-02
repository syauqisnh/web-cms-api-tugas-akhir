const db = require("../models");
const tbl_user = db.tbl_user;
const tbl_customer = db.tbl_customer;

const authenticate = async (req, res, next) =>{
    let uuid = null;
    if(!req.session.userUuid){
        return res.status(401).json({msg: "Mohon login ke akun Anda!"});
    }
    
    try {
        const user = await tbl_customer.findOne({
        where: {
            customer_uuid: req.session.userUuid
        }
        });
        
        const user_admin = await tbl_user.findOne({
            where: {
                user_uuid: req.session.userUuid
            }
        });
        
        // Periksa jika keduanya tidak ditemukan
        if (!user && !user_admin) { 
            return res.status(404).json({ msg: "User tidak ditemukan" });
        } else if (user_admin) {
            uuid = user_admin.user_uuid;
        } else if (user) {
            uuid = user.customer_uuid;
        }
        req.userUuid = uuid;
        next();
    } catch (error) {
        // Penanganan kesalahan pada query database atau lainnya
        console.error(error);
        res.status(500).json({ msg: "Terjadi kesalahan pada server" });
    }
}

const adminOnly = async (req, res, next) =>{
    if(!req.session.userUuid){
        return res.status(401).json({msg: "Mohon login ke akun Anda!"});
    }
    
    try {
        const user = await tbl_user.findOne({
            where: {
                user_uuid: req.session.userUuid
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

module.exports = { authenticate, adminOnly };
