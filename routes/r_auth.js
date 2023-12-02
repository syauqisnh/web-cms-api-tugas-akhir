const router = require('express').Router();

const {
    Login,
    logOut,
    Me,
} = require('../controllers/c_auth')

router.get('/me', Me);
router.post('/login', Login);
router.delete('/logout', logOut);

module.exports = router;