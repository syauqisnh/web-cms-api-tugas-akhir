const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

const {
    post_schedule,
    put_schedule,
    delete_schedule,
    get_all_schedule,
    get_all_byBusiness,
    get_all_byPractice,
    get_schedule_customer,
    get_detail_schedule,
} = require("../controllers/c_scheduling");

router.post("/schedule", post_schedule);
router.put("/schedule/:schedule_uuid", put_schedule);
router.delete("/schedule/:schedule_uuid", delete_schedule);
router.get("/schedule/get_all", get_all_schedule);
router.get('/schedule/get_all_customer', authenticate, get_schedule_customer);
router.get("/schedule_business/:business_uuid", get_all_byBusiness);
router.get("/schedule_practice/:practice_uuid", get_all_byPractice);
router.get("/schedule/:schedule_uuid", get_detail_schedule);

module.exports = router;
