const router = require("express").Router();

const {
  post_levels,
  put_levels,
  delete_levels,
  get_all_levels,
  get_detail_level,
  get_unique_levels,
  get_count_levels
} = require("../controllers/c_levels");

// Restfull API Tabel Levels
router.post("/level", post_levels);
router.put("/level/:level_uuid", put_levels);
router.delete("/level/:level_uuid", delete_levels);
router.get("/level/get_all", get_all_levels);
router.get("/level/:level_uuid", get_detail_level);
router.get("/level/get_unique/:columnName/:columnValue", get_unique_levels);
router.get("/level/get_count/:columnName/:columnValue", get_count_levels);

module.exports = router;
