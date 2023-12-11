const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

const {
    get_all_media,
    post_upload_media,
} = require('../controllers/c_media');

router.get('/media/get_all', get_all_media);
router.post('/media/upload_media', post_upload_media);

module.exports = router;