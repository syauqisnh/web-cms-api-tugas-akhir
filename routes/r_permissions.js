const router = require('express').Router();

const {
    post_permissions,
    put_permissions,
    delete_permissions,
    get_all_permissions,
    get_detail_permissions,
    get_unique_permissions,
    get_count_permissions
} = require('../controllers/c_permissions');

router.post('/permissions', post_permissions);
router.put('/permissions/:permission_uuid', put_permissions);
router.delete('/permissions/:permission_uuid', delete_permissions);
router.get('/permissions/get_all', get_all_permissions);
router.get('/permissions/get_unique', get_unique_permissions);
router.get('/permissions/get_count', get_count_permissions);
router.get('/permissions/:permission_uuid', get_detail_permissions);

module.exports = router;