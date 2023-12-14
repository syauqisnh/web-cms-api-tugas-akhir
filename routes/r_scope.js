const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

const {
    post_scope,
    put_scope,
    delete_scope,
    get_all_scope,
    get_detail_scope,
    get_unique_scope,
    get_count_scope,
    get_scope_byCustomer,
} = require('../controllers/c_scope')

router.post('/scope',authenticate, post_scope)
router.put('/scope/:scope_uuid', put_scope)
router.delete('/scope/:scope_uuid', delete_scope)
router.get('/scope/get_all', get_all_scope)
router.get('/scope/get_unique', get_unique_scope)
router.get('/scope/get_count', get_count_scope)
router.get('/scope/get_all_customer/', get_scope_byCustomer);
router.get('/scope/:scope_uuid', get_detail_scope)

module.exports = router;