const router = require("express").Router();

const {
    post_payment_via,
    put_payment_via,
    delete_payment_via,
    get_detail_payment_via,
    get_all_payment_via,
    get_unique_payment_via,
    get_count_payment_via
} = require("../controllers/c_payments_via");

router.post("/payment_via", post_payment_via);
router.put("/payment_via/:payment_via_uuid", put_payment_via);
router.delete("/payment_via/:payment_via_uuid", delete_payment_via);
router.get("/payment_via/get_all", get_all_payment_via);
router.get("/payment_via/get_unique", get_unique_payment_via);
router.get("/payment_via/get_count", get_count_payment_via);
router.get("/payment_via/:payment_via_uuid", get_detail_payment_via);

module.exports = router;