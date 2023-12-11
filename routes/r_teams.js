const router = require('express').Router();
// const { authenticate } = require('../middleware/authMiddleware');

const {
    post_teams,
    put_teams,
    delete_teams,
    get_detail_teams,
    get_all_teams,
    get_uniqe_teams,
    get_count_teams,
} = require('../controllers/c_teams');

router.post('/teams', post_teams);
router.put('/teams/:teams_uuid', put_teams);
router.delete('/teams/:teams_uuid', delete_teams);
router.get('/teams/get_all', get_all_teams);
router.get('/teams/get_uniqe', get_uniqe_teams);
router.get('/teams/get_count', get_count_teams);
router.get('/teams/:teams_uuid', get_detail_teams);

module.exports = router;