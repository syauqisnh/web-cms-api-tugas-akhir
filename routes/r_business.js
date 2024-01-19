const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');

const {
    post_business,
    put_business,
    delete_business,
    get_detail_business,
    get_all_business,
    get_uniqe_business,
    get_count_business,
    get_business_byCustomer,
} = require('../controllers/c_business');

router.post('/business',authenticate, post_business);
router.put('/business/:business_uuid',authenticate, put_business);
router.delete('/business/:business_uuid',authenticate, delete_business);
router.get('/business/get_all', get_all_business);
router.get('/business/get_uniqe',authenticate, get_uniqe_business);
router.get('/business/get_count',authenticate, get_count_business);
router.get('/business/get_all_customer/', get_business_byCustomer);
router.get('/business/:business_uuid',authenticate, get_detail_business);

module.exports = router;