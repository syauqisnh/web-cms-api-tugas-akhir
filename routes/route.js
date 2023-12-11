const router = require("express").Router();
const r_auth = require("./r_auth");
const r_levels = require("./r_levels");
const r_modules = require('./r_modules');
const r_permissions = require('./r_permissions');
const r_access = require('./r_access');
const r_media = require('./r_media');
const r_customer = require('./r_customer');
const r_user = require('./r_user');
const r_business = require('./r_business');
const r_teams = require('./r_teams');

router.use("/api/v1", r_auth);
router.use("/api/v1", r_levels);
router.use('/api/v1', r_modules);
router.use('/api/v1', r_permissions);
router.use('/api/v1', r_access);
router.use('/api/v1', r_media);
router.use('/api/v1', r_customer);
router.use('/api/v1', r_user);
router.use('/api/v1', r_business);
router.use('/api/v1', r_teams);

module.exports = router;
