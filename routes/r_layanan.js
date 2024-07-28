const router = require('express').Router();
const { authenticate, adminOnly } = require('../middleware/authMiddleware');

const {
    post_layanan,
    put_layanan,
    delete_layanan,
    get_all_layanan,
    get_detail_layanan_business,
    get_layanan_customer,
    get_detail_layanan,
} = require("../controllers/c_layanan");

router.post("/layanan", post_layanan);
router.put("/layanan/:service_uuid", put_layanan);
router.delete("/layanan/:service_uuid", delete_layanan);
router.get("/layanan/get_all", get_all_layanan);
router.get("/layanan_business/:business_uuid", get_detail_layanan_business);
router.get('/layanan/get_all_customer', authenticate, get_layanan_customer);
router.get("/layanan/:service_uuid", get_detail_layanan);

module.exports = router;
