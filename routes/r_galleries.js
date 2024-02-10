const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');

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

router.post('/galleries', authenticate, post_galleries)
router.put('/galleries/:gallery_uuid',authenticate, put_galleries)
router.delete('/galleries/:gallery_uuid',authenticate, delete_galleries)
router.get('/galleries/get_all',authenticate, get_all_galleries)
router.get('/galleries/get_unique',authenticate, get_unique_galleries)
router.get('/galleries/get_count', authenticate, get_count_galleries)
router.get('/galleries/get_all_customer/', get_galleries_byGalleries);
router.get('/galleries/:gallery_uuid', authenticate, get_detail_galleries)

module.exports = router;