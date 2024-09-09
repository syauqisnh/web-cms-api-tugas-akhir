const router = require('express').Router();

const {
    Login,
    logOut,
    Me,
    registrasi_customer
} = require('../controllers/c_auth')

router.get('/me', Me);
router.post('/login', Login);
router.post('/registrasi', registrasi_customer);
router.delete('/logout', logOut);
router.delete('/logout', logOut);

module.exports = router;