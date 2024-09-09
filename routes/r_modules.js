const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

const {
    post_module,
    put_module,
    delete_module,
    get_all_module,
    get_detail_module,
    get_unique_module,
    get_count_module
} = require('../controllers/c_modules');

router.post('/module', authenticate, adminOnly, post_module);
router.put('/module/:module_uuid', authenticate, adminOnly, put_module);
router.delete('/module/:module_uuid', authenticate, adminOnly, delete_module);
router.get('/module/get_all',authenticate, adminOnly, get_all_module);
router.get('/module/get_unique', authenticate, adminOnly, get_unique_module);
router.get('/module/get_count', authenticate, adminOnly, get_count_module);
router.get('/module/:module_uuid', authenticate, adminOnly, get_detail_module);

module.exports = router;