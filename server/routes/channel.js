const express = require("express");
const router = express.Router();
const {
    channel,
    getInformationForEdit,
    updateInformation,
    channelSubscribers,
    getSubscriptions,
    getRecommended,
    userChannel,
    subscribe,
    unsubscribe,
    alert,
    removeAlert
} = require("../controllers/channel");
const { requireSignIn, checkUser } = require("../controllers/auth");

router.get("/subscriptions", requireSignIn, checkUser, getSubscriptions);

router.get("/recommended", requireSignIn, checkUser, getRecommended);

router.get("/channel", requireSignIn, checkUser, channel);

router.get("/channel/edit", requireSignIn, checkUser, getInformationForEdit)

router.post("/channel/change-information", requireSignIn, checkUser, updateInformation);

router.get("/channel/subscribers", requireSignIn, checkUser, channelSubscribers);

router.get("/channel/:id", requireSignIn, checkUser, userChannel);

router.post("/channel/subscribe", requireSignIn, checkUser, subscribe);

router.post("/channel/unsubscribe", requireSignIn, checkUser, unsubscribe);

router.put("/channel/alert", requireSignIn, checkUser, alert);

router.put("/channel/remove-alert", requireSignIn, checkUser, removeAlert);

module.exports = router;
