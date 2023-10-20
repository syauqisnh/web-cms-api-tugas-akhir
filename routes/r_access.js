const router = require('express').Router();

const {
    post_access,
} = require('../controllers/c_access')

router.post('/access', post_access)

module.exports = router;