const router = require("express").Router();

const {
    post_payment,
    put_payment,
    delete_payment,
    get_detail_payment,
    get_all_payment,
    get_unique_payment,
    get_count_payment,
} = require("../controllers/c_payments");

router.post("/payment", post_payment);
router.put("/payment/:payment_uuid", put_payment);
router.delete("/payment/:payment_uuid", delete_payment);
router.get("/payment/get_all", get_all_payment);
router.get("/payment/get_unique", get_unique_payment);
router.get("/payment/get_count", get_count_payment);
router.get("/payment/:payment_uuid", get_detail_payment);

module.exports = router
