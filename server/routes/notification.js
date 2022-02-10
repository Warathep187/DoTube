const express = require("express");
const router = express.Router();
const { requireSignIn, checkUser } = require("../controllers/auth");
const { getNotification } = require("../controllers/notification");

router.post("/notification/notifications", requireSignIn, checkUser, getNotification);

module.exports = router;