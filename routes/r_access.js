const router = require('express').Router();

const {
    post_access,
    put_access,
    delete_access,
    get_all_access,
    get_unique_access,
    get_count_access,
    get_detail_access,
} = require('../controllers/c_access')

router.post('/access', post_access)
router.put('/access/:access_uuid', put_access)
router.delete('/access/:access_uuid', delete_access)
router.get('/access/get_all', get_all_access)
router.get('/access/get_unique', get_unique_access)
router.get('/api/v1/access/get_count', get_count_access)
router.get('/access/:access_uuid', get_detail_access)

module.exports = router;