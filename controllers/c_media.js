const db = require("../models");
const tbl_media = db.tbl_media;
const Sequelize = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");
const Joi = require("joi");
const fs = require('fs');

const uuidSchema = Joi.object({
  table_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
});

const uuidSchemaMedia = Joi.object({
  media_uuid: Joi.string().guid({ version: "uuidv4" }).required(),
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = "./uploads/";
    if (file.mimetype.includes("image")) {
      dest += "img";
    } else if (file.mimetype === "application/pdf") {
      dest += "pdf";
    } else if (
      file.mimetype.includes("word") ||
      file.mimetype.includes("office")
    ) {
      dest += "doc";
    } else if (file.mimetype.includes("video")) {
      dest += "video";
    } else if (file.mimetype.includes("excel")) {
      dest += "excel";
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "application/pdf" ||
    file.mimetype.includes("word") ||
    file.mimetype.includes("office") ||
    file.mimetype.includes("excel") ||
    file.mimetype.includes("video")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Format file tidak didukung"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 300 * 1024 * 1024 },
});

const post_upload_media = async (req, res) => {
  upload.single("file")(req, res, async (error) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }

    if (!req.file) {
      return res.status(400).send("File tidak ditemukan.");
    }

    const media_uuid = uuidv4(); // UUID unik untuk setiap file
    const file = req.file;
    const extensi = path.extname(file.originalname); // Ekstensi file
    const size = file.size; // Ukuran file dalam bytes

    // Menentukan subdirektori berdasarkan mimetype
    let subdir = "";
    if (file.mimetype.includes("image")) {
      subdir = "img";
    } else if (file.mimetype.includes("pdf")) {
      subdir = "pdf";
    } else if (
      file.mimetype.includes("word") ||
      file.mimetype.includes("office")
    ) {
      subdir = "doc";
    } else if (file.mimetype.includes("video")) {
      subdir = "video";
    } else if (file.mimetype.includes("excel")) {
      subdir = "excel";
    }

    // Pastikan subdirektori tidak kosong
    if (!subdir) {
      return res.status(400).send("Tipe file tidak didukung.");
    }

    // URL file (sesuaikan sesuai setup server Anda)
    const url = `${req.protocol}://${req.get("host")}/uploads/${subdir}/${
      file.filename
    }`;

    try {
      const newMedia = await tbl_media.create({
        media_uuid: media_uuid,
        // Sesuaikan field 'media_uuid_table' dan 'media_table' dengan data yang relevan dari request Anda
        media_uuid_table: null,
        media_table: null,
        media_name: file.originalname,
        media_hash_name: file.filename,
        media_category: subdir, // kategori berdasarkan subdirektori
        media_extensi: extensi.slice(1), // menghapus titik di depan ekstensi
        media_size: size.toString(),
        media_url: url,
        // Tambahkan atau sesuaikan field lain jika diperlukan
        media_metadata: JSON.stringify({
          originalname: file.originalname,
          mimetype: file.mimetype,
        }), // contoh sederhana metadata
      });

      res.status(200).json({
        message: "File berhasil diupload",
        data: newMedia,
      });
    } catch (dbError) {
      res.status(500).json({ message: dbError.message });
    }
  });
};

const post_media_business = async (req, res) => {
  upload.array("file")(req, res, async (error) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }
    if (req.files.length > 1) {
      return res.status(400).send("Hanya satu file saja yang dapat diupload");
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).send("File Tidak Ditemukan");
    }

    try {
      const { value } = uuidSchema.validate(req.params);
      const { table_uuid } = value;

      const uploadedFile = req.files[0]; // Hanya satu file yang diupload
      const extensi = path.extname(uploadedFile.originalname);
      const size = uploadedFile.size;

      let subdir = "";
      if (uploadedFile.mimetype.includes("image")) {
        subdir = "img";
      } else if (uploadedFile.mimetype.includes("pdf")) {
        subdir = "pdf";
      } else if (
        uploadedFile.mimetype.includes("word") ||
        uploadedFile.mimetype.includes("office")
      ) {
        subdir = "doc";
      } else if (uploadedFile.mimetype.includes("video")) {
        subdir = "video";
      } else if (uploadedFile.mimetype.includes("excel")) {
        subdir = "excel";
      }
    
      // Pastikan subdirektori tidak kosong
      if (!subdir) {
        return res.status(400).send("Tipe file tidak didukung.");
      }

      // Menghapus media yang sudah ada sebelumnya, jika ada
      const existingMedia = await tbl_media.findOne({
        where: {
          media_uuid_table: table_uuid,
        }
      });

      if (existingMedia) {
        const filePath = `./uploads/${existingMedia.media_category}/${existingMedia.media_hash_name}`;
        fs.unlink(filePath, (error) => {
          if (error) {
            console.error('Gagal menghapus file lama:', error);
          } else {
            console.log('File lama berhasil dihapus');
          }
        });

        await tbl_media.destroy({
          where: {
            media_uuid_table: table_uuid,
          }
        });
      }

      const media_uuid = uuidv4();
      const url = `${req.protocol}://${req.get("host")}/uploads/${subdir}/${uploadedFile.filename}`;

      const newMedia = await tbl_media.create({
        media_uuid: media_uuid,
        media_uuid_table: table_uuid,
        media_table: "business",
        media_name: uploadedFile.originalname,
        media_hash_name: uploadedFile.filename,
        media_category: subdir,
        media_extensi: extensi.slice(1),
        media_size: size.toString(),
        media_url: url,
        media_metadata: JSON.stringify({
          originalname: uploadedFile.originalname,
          mimetype: uploadedFile.mimetype,
        }),
      });

      res.status(200).json({
        status: true,
        message: "File berhasil diupload",
        data: newMedia,
      });
    } catch (dbError) {
      res.status(500).json({ message: dbError.message });
    }
  });
};

const post_media_price = async (req, res) => {
  upload.array("file")(req, res, async (error) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }
    if (req.files.length > 1) {
      return res.status(400).send("Hanya satu file saja yang dapat diupload");
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).send("File Tidak Ditemukan");
    }

    try {
      const { value } = uuidSchema.validate(req.params);
      const { table_uuid } = value;

      const uploadedFile = req.files[0]; // Hanya satu file yang diupload
      const extensi = path.extname(uploadedFile.originalname);
      const size = uploadedFile.size;

      let subdir = "";
      if (uploadedFile.mimetype.includes("image")) {
        subdir = "img";
      } else if (uploadedFile.mimetype.includes("pdf")) {
        subdir = "pdf";
      } else if (
        uploadedFile.mimetype.includes("word") ||
        uploadedFile.mimetype.includes("office")
      ) {
        subdir = "doc";
      } else if (uploadedFile.mimetype.includes("video")) {
        subdir = "video";
      } else if (uploadedFile.mimetype.includes("excel")) {
        subdir = "excel";
      }
    
      // Pastikan subdirektori tidak kosong
      if (!subdir) {
        return res.status(400).send("Tipe file tidak didukung.");
      }

      // Menghapus media yang sudah ada sebelumnya, jika ada
      const existingMedia = await tbl_media.findOne({
        where: {
          media_uuid_table: table_uuid,
        }
      });

      if (existingMedia) {
        const filePath = `./uploads/${existingMedia.media_category}/${existingMedia.media_hash_name}`;
        fs.unlink(filePath, (error) => {
          if (error) {
            console.error('Gagal menghapus file lama:', error);
          } else {
            console.log('File lama berhasil dihapus');
          }
        });

        await tbl_media.destroy({
          where: {
            media_uuid_table: table_uuid,
          }
        });
      }

      const media_uuid = uuidv4();
      const url = `${req.protocol}://${req.get("host")}/uploads/${subdir}/${uploadedFile.filename}`;

      const newMedia = await tbl_media.create({
        media_uuid: media_uuid,
        media_uuid_table: table_uuid,
        media_table: "price_list",
        media_name: uploadedFile.originalname,
        media_hash_name: uploadedFile.filename,
        media_category: subdir,
        media_extensi: extensi.slice(1),
        media_size: size.toString(),
        media_url: url,
        media_metadata: JSON.stringify({
          originalname: uploadedFile.originalname,
          mimetype: uploadedFile.mimetype,
        }),
      });

      res.status(200).json({
        status: true,
        message: "File berhasil diupload",
        data: newMedia,
      });
    } catch (dbError) {
      res.status(500).json({ message: dbError.message });
    }
  });
};

const post_profile_teams = async (req, res) => {
  upload.array("file")(req, res, async (error) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }

    if (req.files.length > 1) {
      return res.status(400).send("File tidak boleh lebih dari satu.");
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).send("File tidak ditemukan.");
    }

    try {
      const { value } = uuidSchema.validate(req.params);
      const { table_uuid } = value;

      // Cek apakah sudah ada media gambar terkait dengan tabel UUID
      const existingMedia = await tbl_media.findOne({
        where: {
          media_uuid_table: table_uuid,
          media_category: 'img' // Hanya cek untuk kategori gambar
        }
      });

      if (existingMedia) {
        // Mendapatkan nama file yang akan dihapus
        const fileNameToDelete = existingMedia.media_hash_name;

        // Hapus data media yang sudah ada dari database
        await tbl_media.destroy({
          where: {
            media_uuid_table: table_uuid,
            media_category: 'img'
          }
        });

        // Hapus file dari sistem file
        const filePath = `./uploads/img/${fileNameToDelete}`; // Ganti dengan path sesuai dengan struktur penyimpanan Anda
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          } else {
            console.log("File deleted successfully");
          }
        });
      }

      const uploadedFiles = req.files;
      const uploadedMedia = [];

      for (const file of uploadedFiles) {
        const media_uuid = uuidv4();
        const extensi = path.extname(file.originalname);
        const size = file.size;

        let subdir = "";
        if (file.mimetype.includes("image")) {
          subdir = "img";
        }

        if (!subdir) {
          return res.status(400).send("Tipe file tidak didukung.");
        }

        const url = `${req.protocol}://${req.get("host")}/uploads/${subdir}/${file.filename}`;

        const newMedia = await tbl_media.create({
          media_uuid: media_uuid,
          media_uuid_table: table_uuid,
          media_table: "teams",
          media_name: file.originalname,
          media_hash_name: file.filename,
          media_category: subdir,
          media_extensi: extensi.slice(1),
          media_size: size.toString(),
          media_url: url,
          media_metadata: JSON.stringify({
            originalname: file.originalname,
            mimetype: file.mimetype,
          }),
        });

        uploadedMedia.push(newMedia);
      }

      res.status(200).json({
        status: true,
        message: "File berhasil diupload",
        data: uploadedMedia,
      });
    } catch (dbError) {
      res.status(500).json({ message: dbError.message });
    }
  });
};

const post_upload_media_any = async (req, res) => {
  upload.any()(req, res, async (error) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).send("File tidak ditemukan.");
    }

    try {
      const { value } = uuidSchema.validate(req.params);
      const { table_uuid } = value;
      const uploadedMedia = [];

      for (const file of req.files) {
        const media_uuid = uuidv4(); // UUID unik untuk setiap file
        const extensi = path.extname(file.originalname); // Ekstensi file
        const size = file.size; // Ukuran file dalam bytes

        // Menentukan subdirektori berdasarkan mimetype
        let subdir = "";
        if (file.mimetype.includes("image")) {
          subdir = "img";
        } else if (file.mimetype.includes("video")) {
          subdir = "video";
        }

        // Pastikan subdirektori tidak kosong
        if (!subdir) {
          return res.status(400).send("Tipe file tidak didukung.");
        }

        // URL file (sesuaikan sesuai setup server Anda)
        const url = `${req.protocol}://${req.get("host")}/uploads/${subdir}/${
          file.filename
        }`;

        const newMedia = await tbl_media.create({
          media_uuid: media_uuid,
          // Sesuaikan field 'media_uuid_table' dan 'media_table' dengan data yang relevan dari request Anda
          media_uuid_table: table_uuid,
          media_table: "galleries",
          media_name: file.originalname,
          media_hash_name: file.filename,
          media_category: subdir, // kategori berdasarkan subdirektori
          media_extensi: extensi.slice(1), // menghapus titik di depan ekstensi
          media_size: size.toString(),
          media_url: url,
          // Tambahkan atau sesuaikan field lain jika diperlukan
          media_metadata: JSON.stringify({
            originalname: file.originalname,
            mimetype: file.mimetype,
          }), // contoh sederhana metadata
        });

        uploadedMedia.push(newMedia);
      }

      res.status(200).json({
        message: "File berhasil diupload",
        data: uploadedMedia,
      });
    } catch (dbError) {
      res.status(500).json({ message: dbError.message });
    }
  });
};

const delete_media = async (req, res) => {
  try {
    const { error, value } = uuidSchemaMedia.validate(req.params)

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      })
    }

    const { media_uuid } = value;

    const delete_media = await tbl_media.findOne({
      where: {
        media_uuid
      }
    })

    if (!delete_media) {
      return res.status(400).json({
        success: false,
        message: 'Gagal menghapus data',
        data: null,
      })
    }

    const deleteMedia = await tbl_media.findAll({
      where: {
        media_uuid
      }
    })

    for (const media of deleteMedia) {
      const filePath = `./uploads/${media.media_category}/${media.media_hash_name}`;
      fs.unlink(filePath, (error) => {
        if (error) {
          console.error('File gagal di hapus:', error)
        } else {
          console.log('Sukses menambahkan data')
        }
      })
    }

    await delete_media.update({ media_delete_at: new Date() });

    res.status(200).json({
      success: true,
      message: 'Sukses Menghapus Data'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      data: null
    })
  }
}

const get_all_media = async (req, res) => {
  try {
    const {
      limit = null,
      page = null,
      keyword = "",
      filter = {},
      order = { media_id: "desc" },
    } = req.query;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      media_delete_at: null,
    };

    if (filter.media_table) {
      const filterNames = Array.isArray(filter.media_table)
        ? filter.media_table
        : filter.media_table.split(",");

      if (filterNames.length > 0) {
        whereClause.media_table = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.media_table");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }
    if (keyword) {
      const keywordClause = {
        [Sequelize.Op.like]: `%${keyword}%`,
      };
      offset = 0;

      whereClause.media_table = whereClause.media_table
        ? { [Sequelize.Op.and]: [whereClause.media_table, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_media.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((media) => ({
        media_table: media.media_table,
        media_name: media.media_name,
        media_hash_name: media.media_hash_name,
        media_category: media.media_category,
        media_extensi: media.media_extensi,
        media_size: media.media_size,
        media_url: media.media_url,
        media_metadata: media.media_metadata,
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
      return res.status(200).json({
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

    const currentUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const excludePagesUrl = "http://localhost:9900/api/v1/media/get_all";

    if (currentUrl === excludePagesUrl) {
      delete result.pages;
    }

    res.status(200).json(result);
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const get_detail_media = async (req, res) => {
  try {
    const { value } = uuidSchema.validate(req.params);
    const { table_uuid } = value;
    const {
      limit = null,
      page = null,
      keyword = "",
      filter = {},
      order = { media_id: "desc" },
    } = req.query;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      media_uuid_table: table_uuid,
      media_delete_at: null,
    };

    if (filter.media_table) {
      const filterNames = Array.isArray(filter.media_table)
        ? filter.media_table
        : filter.media_table.split(",");

      if (filterNames.length > 0) {
        whereClause.media_table = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.media_table");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }
    if (keyword) {
      const keywordClause = {
        [Sequelize.Op.like]: `%${keyword}%`,
      };
      offset = 0;

      whereClause.media_table = whereClause.media_table
        ? { [Sequelize.Op.and]: [whereClause.media_table, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_media.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((media) => ({
        media_uuid: media.media_uuid,
        media_uuid_table: media.media_uuid_table,
        media_table: media.media_table,
        media_name: media.media_name,
        media_hash_name: media.media_hash_name,
        media_category: media.media_category,
        media_extensi: media.media_extensi,
        media_size: media.media_size,
        media_url: media.media_url,
        media_metadata: media.media_metadata,
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
      return res.status(200).json({
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

    const currentUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const excludePagesUrl = "http://localhost:9900/api/v1/media/get_all";

    if (currentUrl === excludePagesUrl) {
      delete result.pages;
    }

    res.status(200).json(result);
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

const get_detail_mediabymediauuid = async (req, res) => {
  try {
    const { value } = uuidSchemaMedia.validate(req.params);
    const { media_uuid } = value;
    const {
      limit = null,
      page = null,
      keyword = "",
      filter = {},
      order = { media_id: "desc" },
    } = req.query;

    let offset = limit && page ? (page - 1) * limit : 0;
    const orderField = Object.keys(order)[0];
    const orderDirection =
      order[orderField]?.toLowerCase() === "asc" ? "ASC" : "DESC";

    const whereClause = {
      media_uuid: media_uuid,
      media_delete_at: null,
    };

    if (filter.media_table) {
      const filterNames = Array.isArray(filter.media_table)
        ? filter.media_table
        : filter.media_table.split(",");

      if (filterNames.length > 0) {
        whereClause.media_table = {
          [Sequelize.Op.or]: filterNames.map((name) => ({
            [Sequelize.Op.like]: `%${name.trim()}%`,
          })),
          [Sequelize.Op.not]: null,
        };
      } else {
        console.log("Empty filter.media_table");
        return res.status(404).json({
          success: false,
          message: "Data Tidak Di Temukan",
        });
      }
    }
    if (keyword) {
      const keywordClause = {
        [Sequelize.Op.like]: `%${keyword}%`,
      };
      offset = 0;

      whereClause.media_table = whereClause.media_table
        ? { [Sequelize.Op.and]: [whereClause.media_table, keywordClause] }
        : keywordClause;
    }

    const data = await tbl_media.findAndCountAll({
      where: whereClause,
      order: [[orderField, orderDirection]],
      limit: limit ? parseInt(limit) : null,
      offset: offset ? parseInt(offset) : null,
    });

    const totalPages = limit ? Math.ceil(data.count / (limit || 1)) : 1;

    const result = {
      success: true,
      message: "Sukses mendapatkan data",
      data: data.rows.map((media) => ({
        media_uuid: media.media_uuid,
        media_uuid_table: media.media_uuid_table,
        media_table: media.media_table,
        media_name: media.media_name,
        media_hash_name: media.media_hash_name,
        media_category: media.media_category,
        media_extensi: media.media_extensi,
        media_size: media.media_size,
        media_url: media.media_url,
        media_metadata: media.media_metadata,
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
      return res.status(200).json({
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

    const currentUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const excludePagesUrl = "http://localhost:9900/api/v1/media/get_all";

    if (currentUrl === excludePagesUrl) {
      delete result.pages;
    }

    res.status(200).json(result);
  } catch (error) {
    console.log(error, "Data Error");
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

module.exports = {
  get_all_media,
  post_upload_media,
  post_profile_teams,
  post_media_price,
  post_media_business,
  delete_media,
  post_upload_media_any,
  get_detail_media,
  get_detail_mediabymediauuid,
};
