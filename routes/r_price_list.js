const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');

const {
    post_price_list,
    put_price_list,
    delete_price_list,
    get_detail_price_list,
    get_all_price_list,
    get_uniqe_price_list,
    get_count_price_list,
    get_price_byBusiness,
} = require('../controllers/c_price_list');

router.post('/price_list',authenticate, post_price_list);
router.put('/price_list/:price_list_uuid',authenticate, put_price_list);
router.delete('/price_list/:price_list_uuid',authenticate, delete_price_list);
router.get('/price_list/get_all',authenticate, get_all_price_list);
router.get('/price_list/get_uniqe',authenticate, get_uniqe_price_list);
router.get('/price_list/get_count',authenticate, get_count_price_list);
router.get('/price_list/get_all_customer/', get_price_byBusiness);
router.get('/price_list/:price_list_uuid',authenticate, get_detail_price_list);

module.exports = router;