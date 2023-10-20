const db = require("../models");
const tbl_access = db.tbl_access;
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");

const post_access = async (req, res) => {
    try {
        const {
            access_modul,
            access_permission,
            access_level
        } = req.body
    
        if (!access_modul || !access_permission || !access_level) {
            
        }
    
        const access_uuid = uuidv4();
    
        const new_access = await tbl_access.create({
    
        })
        
        if (condition) {
            
        }

        res.status(200).json({

        })
    } catch (error) {
        console.error(error, 'Data Error')
        res.status(500).json({
            success: false,
            message: 'Internal Server Eror',
            data: null
        })
    }
}

module.exports = {
    post_access
}
