const db = require("../models");
const tbl_media = db.tbl_media;
const Sequelize = require("sequelize");

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
};
