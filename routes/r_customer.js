const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

const {
    post_customer,
    put_customer,
    delete_customer,
    get_detail_customer,
    get_all_customer,
    get_uniqe_customer,
    get_count_customer,
} = require('../controllers/c_customer');

router.post('/customer',authenticate, adminOnly, post_customer);
router.put('/customer/:customer_uuid',authenticate, put_customer);
router.delete('/customer/:customer_uuid', authenticate, adminOnly, delete_customer);
router.get('/customer/get_all',authenticate, adminOnly, get_all_customer);
router.get('/customer/get_uniqe', authenticate, get_uniqe_customer);
router.get('/customer/get_count', authenticate, adminOnly, get_count_customer);
router.get('/customer/:customer_uuid',authenticate, get_detail_customer);

module.exports = router;