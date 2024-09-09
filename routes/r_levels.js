const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

const {
  post_levels,
  put_levels,
  delete_levels,
  get_all_levels,
  get_detail_level,
  get_unique_levels,
  get_count_levels
} = require("../controllers/c_levels");

router.post("/level", post_levels);
router.put("/level/:level_uuid",authenticate, adminOnly, put_levels);
router.delete("/level/:level_uuid",authenticate, adminOnly, delete_levels);
router.get("/level/get_all",authenticate, adminOnly, get_all_levels);
router.get("/level/get_unique",authenticate, adminOnly, get_unique_levels);
router.get("/level/get_count",authenticate, adminOnly,  get_count_levels);
router.get("/level/:level_uuid",authenticate, adminOnly, get_detail_level);

module.exports = router;
