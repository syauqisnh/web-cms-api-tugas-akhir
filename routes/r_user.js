const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/authMiddleware'); // Impor middleware

const {
    post_user,
    put_user,
    delete_user,
    get_detail_user,
    get_all_user,
    get_uniqe_user,
    get_count_user,
} = require('../controllers/c_user');

router.post('/user',authenticate, adminOnly, post_user); // Rute ini tidak dilindungi, misalnya untuk pendaftaran
router.put('/user/:user_uuid', authenticate, adminOnly, put_user); // Rute ini dilindungi
router.delete('/user/:user_uuid', authenticate, adminOnly, delete_user); // Rute ini dilindungi
router.get('/user/get_all',authenticate, adminOnly, get_all_user); // Rute ini dilindungi
router.get('/user/get_uniqe', authenticate, adminOnly, get_uniqe_user); // Rute ini dilindungi
router.get('/user/get_count', authenticate, adminOnly, get_count_user); // Rute ini dilindungi
router.get('/user/:user_uuid', authenticate, adminOnly, get_detail_user); // Rute ini dilindungi

module.exports = router;
