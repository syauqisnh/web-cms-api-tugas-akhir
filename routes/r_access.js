const router = require('express').Router();

const {
    post_access,
    put_access
} = require('../controllers/c_access')

router.post('/access', post_access)
router.put('/access/:access_uuid', put_access)

module.exports = router;