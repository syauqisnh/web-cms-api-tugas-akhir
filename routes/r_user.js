const router = require('express').Router();

const {
    post_user,
    put_user,
    delete_user,
    get_detail_user,
    get_all_user,
    get_uniqe_user,
    get_count_user,
} = require('../controllers/c_user');

router.post('/user', post_user);
router.put('/user/:user_uuid', put_user);
router.delete('/user/:user_uuid', delete_user);
router.get('/user/get_all', get_all_user);
router.get('/user/get_uniqe', get_uniqe_user);
router.get('/user/get_count', get_count_user);
router.get('/user/:user_uuid', get_detail_user);

module.exports = router;