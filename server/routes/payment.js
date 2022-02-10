const express = require("express");
const router = express.Router();
const { requireSignIn, checkUser } = require("../controllers/auth");
const {
    createPayment,
    getProcessing,
    getPurchased,
    getSelling,
} = require("../controllers/payment");

router.post("/payment/create", requireSignIn, checkUser, createPayment);

router.get("/payment/processing", requireSignIn, checkUser, getProcessing);

router.get("/payment/purchased", requireSignIn, checkUser, getPurchased);

router.get("/payment/selling", requireSignIn, checkUser, getSelling);

module.exports = router;
