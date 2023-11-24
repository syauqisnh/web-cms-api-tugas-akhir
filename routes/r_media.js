const router = require('express').Router();

const {
    get_all_media,
} = require('../controllers/c_media');

router.get('/media/get_all', get_all_media);

module.exports = router;