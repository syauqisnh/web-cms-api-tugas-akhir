const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

const {
    get_all_media,
} = require('../controllers/c_media');

router.get('/media/get_all', authenticate, adminOnly, get_all_media);

module.exports = router;