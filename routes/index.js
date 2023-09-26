const router = require("express").Router();
const r_levels = require("./r_levels")

router.use("/api/v1", r_levels)

module.exports = router;
