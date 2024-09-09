const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

const {
    post_practice_schedule,
    put_practice_schedule,
    delete_practice_schedule,
    get_all_practice_schedule,
    get_all_practice_schedule_customer,
    get_all_byLayanan,
    get_all_byDokter,
    get_all_byBusiness,
    get_detail_practice_schedule,
} = require("../controllers/c_practice_schedule");

router.post("/practice", post_practice_schedule);
router.put("/practice/:practice_uuid", put_practice_schedule);
router.delete("/practice/:practice_uuid", delete_practice_schedule);
router.get("/practice/get_all", get_all_practice_schedule);
router.get('/practice/get_all_customer', authenticate, get_all_practice_schedule_customer);
router.get("/practice_layanan/:layanan_uuid", get_all_byLayanan);
router.get("/practice_dokter/:dokter_uuid", get_all_byDokter);
router.get("/practice_business/:business_uuid", get_all_byBusiness);
router.get("/practice/:practice_uuid", get_detail_practice_schedule);

module.exports = router;
