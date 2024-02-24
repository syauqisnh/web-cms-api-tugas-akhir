const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

const {
    get_all_media,
    post_profile_teams,
    post_upload_media,
    post_upload_media_any,
    get_detail_media,
} = require('../controllers/c_media');

router.get('/media/get_all', get_all_media);
router.post('/media/upload_media_profile/:table_uuid', post_profile_teams);
router.post('/media/upload_media', post_upload_media);
router.post('/media/upload_media_any/:table_uuid', post_upload_media_any);
router.get('/media/:table_uuid', get_detail_media);

module.exports = router;