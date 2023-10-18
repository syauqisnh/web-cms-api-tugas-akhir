const router = require('express').Router();

const {
    post_module,
    put_module,
    delete_module,
    get_all_module,
    get_detail_module,
    get_unique_module,
    get_count_module
} = require('../controllers/c_modules');

router.post('/module', post_module);
router.put('/module/:module_uuid', put_module);
router.delete('/module/:module_uuid', delete_module);
router.get('/module/get_all', get_all_module);
router.get('/module/get_unique', get_unique_module);
router.get('/module/get_count', get_count_module);
router.get('/module/:module_uuid', get_detail_module);

module.exports = router;