const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

const {
    post_user,
    put_user,
    delete_user,
    get_detail_user,
    get_all_user,
    get_uniqe_user,
    get_count_user,
} = require('../controllers/c_user');

router.post('/user',authenticate, adminOnly, post_user); 
router.put('/user/:user_uuid', authenticate, adminOnly, put_user); 
router.delete('/user/:user_uuid', authenticate, adminOnly, delete_user); 
router.get('/user/get_all',authenticate, adminOnly, get_all_user);
router.get('/user/get_uniqe', authenticate, adminOnly, get_uniqe_user);
router.get('/user/get_count', authenticate, adminOnly, get_count_user);
router.get('/user/:user_uuid', authenticate, adminOnly, get_detail_user);

module.exports = router;
