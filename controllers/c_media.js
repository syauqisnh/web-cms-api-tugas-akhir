const db = require("../models");
const tbl_media = db.tbl_media;
const Sequelize = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = './uploads/';
    if (file.mimetype.includes('image')) {
      dest += 'img';
    } else if (file.mimetype === 'application/pdf') {
      dest += 'pdf';
    } else if (file.mimetype.includes('word') || file.mimetype.includes('office')) {
      dest += 'doc';
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});


// Filter file (opsional, sesuaikan sesuai kebutuhan)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ||
      file.mimetype === 'application/pdf' || 
      file.mimetype.includes('word') || file.mimetype.includes('office')) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung'), false);
  }
};

// Inisialisasi upload
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 300 * 1024 * 1024 } // 5MB max file size
});


const post_upload_media = async (req, res) => {
  upload.single('file')(req, res, async (error) => {
    if (error) {
      return res.status(500).json({ message: error.message });
    }

    if (!req.file) {
      return res.status(400).send('File tidak ditemukan.');
    }

    const media_uuid = uuidv4(); // UUID unik untuk setiap file
    const file = req.file;
    const extensi = path.extname(file.originalname); // Ekstensi file
    const size = file.size; // Ukuran file dalam bytes

    // Menentukan subdirektori berdasarkan mimetype
    let subdir = '';
    if (file.mimetype.includes('image')) {
      subdir = 'img';
    } else if (file.mimetype.includes('pdf')) {
      subdir = 'pdf';
    } else if (file.mimetype.includes('word') || file.mimetype.includes('office')) {
      subdir = 'doc'; // Perbaikan dari 'word' menjadi 'doc'
    }

    // Pastikan subdirektori tidak kosong
    if (!subdir) {
      return res.status(400).send('Tipe file tidak didukung.');
    }

    // URL file (sesuaikan sesuai setup server Anda)
    const url = `${req.protocol}://${req.get('host')}/uploads/${subdir}/${file.filename}`;

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
        media_metadata: JSON.stringify({ originalname: file.originalname, mimetype: file.mimetype }), // contoh sederhana metadata
      });

      res.status(200).json({
        message: 'File berhasil diupload',
        data: newMedia
      });
    } catch (dbError) {
      res.status(500).json({ message: dbError.message });
    }
  });
};

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
        media_metadata: media.media_metadata
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
};
