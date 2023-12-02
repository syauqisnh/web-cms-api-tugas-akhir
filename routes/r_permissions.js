const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

const {
    post_permissions,
    put_permissions,
    delete_permissions,
    get_all_permissions,
    get_detail_permissions,
    get_unique_permissions,
    get_count_permissions
} = require('../controllers/c_permissions');

router.post('/permissions', authenticate, adminOnly, post_permissions);
router.put('/permissions/:permission_uuid', authenticate, adminOnly, put_permissions);
router.delete('/permissions/:permission_uuid', authenticate, adminOnly, delete_permissions);
router.get('/permissions/get_all', authenticate, adminOnly, get_all_permissions);
router.get('/permissions/get_unique', authenticate, adminOnly, get_unique_permissions);
router.get('/permissions/get_count', authenticate, adminOnly, get_count_permissions);
router.get('/permissions/:permission_uuid', authenticate, adminOnly, get_detail_permissions);

module.exports = router;