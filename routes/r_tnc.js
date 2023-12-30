const router = require('express').Router();
// const { authenticate, adminOnly } = require('../middleware/authMiddleware');

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

router.post('/tnc', post_tnc)
router.put('/tnc/:tnc_uuid', put_tnc)
router.delete('/tnc/:tnc_uuid', delete_tnc)
router.get('/tnc/get_all', get_all_tnc)
router.get('/tnc/get_unique', get_uniqe_tnc)
router.get('/tnc/get_count', get_count_tnc)
router.get('/tnc/get_all_customer/', get_tnc_byPriceList);
router.get('/tnc/:tnc_uuid', get_detail_tnc)

module.exports = router;