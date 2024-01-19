const router = require('express').Router();
const { authenticate } = require('../middleware/authMiddleware');

const {
    post_teams,
    put_teams,
    delete_teams,
    get_detail_teams,
    get_all_teams,
    get_uniqe_teams,
    get_count_teams,
    get_all_byScope,
} = require('../controllers/c_teams');

router.post('/teams',authenticate, post_teams);
router.put('/teams/:team_uuid',authenticate, put_teams);
router.delete('/teams/:team_uuid',authenticate, delete_teams);
router.get('/teams/get_all',authenticate, get_all_teams);
router.get('/teams/get_uniqe',authenticate, get_uniqe_teams);
router.get('/teams/get_count',authenticate, get_count_teams);
router.get('/teams/get_all_customer/', get_all_byScope);
router.get('/teams/:team_uuid',authenticate, get_detail_teams);

module.exports = router;