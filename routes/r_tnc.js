const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');

const {
    post_tnc,
    put_tnc,
    delete_tnc,
    get_all_tnc,
    get_detail_tnc,
    get_uniqe_tnc,
    get_count_tnc,
    get_tnc_byPriceList,
} = require('../controllers/c_tnc')

router.post('/tnc',authenticate, post_tnc)
router.put('/tnc/:tnc_uuid',authenticate, put_tnc)
router.delete('/tnc/:tnc_uuid',authenticate, delete_tnc)
router.get('/tnc/get_all',authenticate, get_all_tnc)
router.get('/tnc/get_unique',authenticate, get_uniqe_tnc)
router.get('/tnc/get_count',authenticate, get_count_tnc)
router.get('/tnc/get_all_customer/', get_tnc_byPriceList);
router.get('/tnc/:tnc_uuid',authenticate, get_detail_tnc)

module.exports = router;