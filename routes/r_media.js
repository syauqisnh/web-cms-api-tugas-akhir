const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

const {
    get_all_media,
    post_upload_media,
    post_upload_media_any,
    get_all_media_Byalbum,
} = require('../controllers/c_media');

router.get('/media/get_all', get_all_media);
router.get('/media/get_By_uuid_table/:table_uuid', get_all_media_Byalbum);
router.post('/media/upload_media', post_upload_media);
router.post('/media/upload_media_any/:table_uuid', post_upload_media_any);

module.exports = router;