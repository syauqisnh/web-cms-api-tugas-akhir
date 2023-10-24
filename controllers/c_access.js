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
            return res.status(400).json({
                success: false,
                message: 'Data harus di isi',
                data: null,
            })
        }
    
        const access_uuid = uuidv4();
    
        const new_access = await tbl_access.create({
            access_uuid: access_uuid,
            access_modul: access_modul,
            access_permission: access_permission,
            access_level: access_level,
        })
        
        if (!new_access) {
            return res.status(404).json({
                success: true,
                message: 'Gagal menambahkan data',
                data: null
            })
        }

        res.status(200).json({
            success: true,
            message: 'Berhasil Menambahkan Data',
            data: {
                access_uuid: new_access.access_uuid,
                access_modul: new_access.access_modul,
                access_permission: new_access.access_permission,
                access_level: new_access.access_level
            }
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

const put_access = async (req, res) => {
    try {
        const {access_uuid} = req.params
        const {
            access_modul,
            access_permission,
            access_level
        } = req.body
        
        if (!access_modul || !access_permission || !access_level) {
            return res.status(400).json({
                success: false,
                message: 'Data harus di isi',
                data: null
            })
        }

        const new_update = await tbl_access.findOne({
            where: {access_uuid}
        })

        new_update.access_modul = access_modul;
        await new_update.save();

        new_update.access_permission = access_permission;
        await new_update.save();

        new_update.access_level = access_level;
        await new_update.save();

        new_update.access_update_at = new Date();
        await new_update.save();

        if (!new_update) {
            return res.status(404).json({
                success: false,
                message: 'Gagal mengedit data',
                data: null
            })
        }

        res.status(200).json({
            success: true,
            message: 'Berhasil mengedit data',
            data: {
                access_modul: new_update.access_modul,
                access_permission: new_update.access_permission,
                access_level: new_update.access_level,
                access_create_at: new_update.access_create_at,
                access_update_at: new_update.access_update_at,
            }
        })
    } catch (error) {
        console.error(error, 'Sistem Error')
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            data: null
        })
    }
}

module.exports = {
    post_access,
    put_access
}
