const router = require("express").Router();
const r_levels = require("./r_levels");
const r_modules = require('./r_modules');
const r_permissions = require('./r_permissions');
const r_access = require('./r_access');

router.use("/api/v1", r_levels);
router.use('/api/v1', r_modules);
router.use('/api/v1', r_permissions);
router.use('/api/v1', r_access);

module.exports = router;
