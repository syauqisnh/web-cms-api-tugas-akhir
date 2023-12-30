const router = require('express').Router();
// const { authenticate, adminOnly } = require('../middleware/authMiddleware');

const {
    post_galleries,
    put_galleries,
    delete_galleries,
    get_all_galleries,
    get_detail_galleries,
    get_unique_galleries,
    get_count_galleries,
    get_galleries_byGalleries,
} = require('../controllers/c_galleries')

router.post('/galleries', post_galleries)
router.put('/galleries/:galleries_uuid', put_galleries)
router.delete('/galleries/:galleries_uuid', delete_galleries)
router.get('/galleries/get_all', get_all_galleries)
router.get('/galleries/get_unique', get_unique_galleries)
router.get('/galleries/get_count', get_count_galleries)
router.get('/galleries/get_all_customer/', get_galleries_byGalleries);
router.get('/galleries/:galleries_uuid', get_detail_galleries)

module.exports = router;