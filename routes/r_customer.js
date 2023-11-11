const router = require('express').Router();

const {
    post_customer,
    put_customer,
    delete_customer,
    get_detail_customer,
    // get_all_customer,
    // get_uniqe_customer,
    // get_count_customer,
} = require('../controllers/c_customer');

router.post('/customer', post_customer);
router.put('/customer/:customer_uuid', put_customer);
router.delete('/customer/:customer_uuid', delete_customer);
// router.get('/customer/get_all', get_all_customer);
// router.get('/customer/get_uniqe', get_uniqe_customer);
// router.get('/customer/get_count', get_count_customer);
router.get('/customer/:customer_uuid', get_detail_customer);

module.exports = router;