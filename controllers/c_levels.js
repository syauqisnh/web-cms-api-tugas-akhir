const db = require("../models");
const tbl_levels = db.tbl_levels;
const { v4: uuidv4 } = require("uuid");

// Untuk CREATE Datanya
const post_levels = async (req, res) => {
  try {
    const { level_name } = req.body;

    const level_uuid = uuidv4();

    const new_levels = await tbl_levels.create({
      level_uuid: level_uuid,
      level_name: level_name,
    });

    res.status(200).json({
      success: true,
      message: "Successfully Adding Data Levels",
      data: {
        level_uuid: new_levels.level_uuid,
        level_name: new_levels.level_name,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
    res.status(402).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// Untuk Edit Datanya
const put_levels = async (req, res) => {
  try {
    const { level_uuid } = req.params;
    const { level_name } = req.body;

    // Mencari entitas level berdasarkan level_uuid
    const update_levels = await tbl_levels.findOne({
      where: { level_uuid },
    });

    if (!update_levels) {
      return res.status(402).json({
        success: false,
        message: "Failed to change data",
        data: null,
      });
    }

    // Mengganti nilai level_name
    update_levels.level_name = level_name;

    // Menyimpan perubahan ke basis data
    await update_levels.save();

    update_levels.level_update_at = new Date();
    await update_levels.save();

    res.json({
      success: true,
      message: "Success changing data levels",
      data: {
        level_name: update_levels.level_name,
        level_create_at: update_levels.level_create_at,
        level_update_at: update_levels.level_update_at,
      },
    });
  } catch (error) {
    console.log(error, "Data Error");
    res.status(402).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// Untuk Delete Datanya
const delete_levels = async (req, res) => {
  try {
    const { level_uuid } = req.params;

    // Mencari entitas level berdasarkan level_uuid
    const delete_levels = await tbl_levels.findOne({
      where: { level_uuid },
    });

    if (!delete_levels) {
      return res.status(404).json({
        success: false,
        message: "Failed to delete data",
        data: null,
      });
    }

    // Mengatur nilai deleted_at untuk menandai data sebagai "soft deleted"
    await delete_levels.update({ level_delete_at: new Date() });

    res.json({
      success: true,
      message: "Success delete data",
    });
  } catch (error) {
    console.log(error, "Data Error");
    res.status(402).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// Untuk Menampilkan datanya berdasarkan UUID
const get_detail_level = async (req, res) => {
  try {
    const { level_uuid } = req.params;

    const detail_level = await tbl_levels.findOne({
      where: { level_uuid },
    });

    if (!detail_level) {
      return res.status(404).json({
        success: false,
        message: "Failed to get data",
        data: null,
      });
    }

    const result = {
      success: true,
      message: "Success in getting detailed data",
      data: {
        level_uuid: detail_level.level_uuid,
        level_name: detail_level.level_name
      }
    };

    res.json(result);
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// Untuk Menampilkan Seluruh Datanya
const get_all_levels = async (req, res) => {
  try {
    const data = await tbl_levels.findAll({
      where: {
        level_delete_at: null,
      },
    });

    const result = {
      success: true,
      message: "Successfully displays level data",
      data: data.map((level) => ({
        level_uuid: level.level_uuid,
        level_name: level.level_name,
      })),
    };

    res.json(result);
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// Untuk mendapatkan Data yang uniqe
const get_unique_levels = async (req, res) => {
  try {
    const { columnName, columnValue } = req.params;

    const uniqueData = await tbl_levels.findOne({
      where: {
        [columnName]: columnValue,
        level_delete_at: null,
      },
    });

    if (!uniqueData) {
      return res.status(200).json({
        success: true,
        message: "Data not found",
        data: null,
      });
    }

    const result = {
      success: true,
      message: "Success in getting unique data",
      data: {
        level_uuid: uniqueData.level_uuid,
        level_name: uniqueData.level_name,
      },
    };

    res.json(result);
  } catch (error) {
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(400).json({
        success: false,
        message: "Invalid column name",
        data: null,
      });
    }
    
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

// Untuk Mendapatkan Jumlah Data Pada Database
const get_count_levels = async (req, res) => {
  try {
    const { columnName, columnValue } = req.params;

    const count = await tbl_levels.count({
      where: {
        [columnName]: columnValue,
        level_delete_at: null,
      },
    });

    const result = {
      success: true,
      message: "Success in getting data count",
      data: {
        value: columnValue,
        count: count,
      },
    };

    res.json(result);
  } catch (error) {
    if (error.name === 'SequelizeDatabaseError') {
      // Nama kolom salah, respons 400
      return res.status(400).json({
        success: false,
        message: "Invalid column name",
        data: null,
      });
    }
    
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};


module.exports = {
  post_levels,
  put_levels,
  delete_levels,
  get_all_levels,
  get_detail_level,
  get_unique_levels,
  get_count_levels,
};
