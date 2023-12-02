const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

const {
    post_access,
    put_access,
    delete_access,
    get_all_access,
    get_detail_access,
    get_unique_access,
    get_count_access,
} = require('../controllers/c_access')

router.post('/access',  authenticate, adminOnly, post_access)
router.put('/access/:access_uuid',  authenticate, adminOnly, put_access)
router.delete('/access/:access_uuid',  authenticate, adminOnly, delete_access)
router.get('/access/get_all',  authenticate, adminOnly, get_all_access)
router.get('/access/get_unique',  authenticate, adminOnly, get_unique_access)
router.get('/access/get_count',  authenticate, adminOnly, get_count_access)
router.get('/access/:access_uuid',  authenticate, adminOnly, get_detail_access)

module.exports = router;