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
} = require('../controllers/c_business');

router.post('/business',authenticate, post_business);
router.put('/business/:business_uuid', put_business);
router.delete('/business/:business_uuid', delete_business);
router.get('/business/get_all', get_all_business);
router.get('/business/get_uniqe', get_uniqe_business);
router.get('/business/get_count', get_count_business);
router.get('/business/:business_uuid', get_detail_business);

module.exports = router;