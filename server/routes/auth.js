const express = require("express");
const router = express.Router();
const { registerValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator } = require("../validators/auth");
const { requireSignIn, register, login, verify, resetPassword, forgotPassword, getLoggedInUserData, checkIsUser, logout } = require("../controllers/auth");

router.post("/register", registerValidator, register);

router.post("/verify-account", verify)

router.post("/login", loginValidator, login)

router.post("/forgot-password", forgotPasswordValidator, forgotPassword);

router.post("/reset-password", resetPasswordValidator, resetPassword);

router.get("/get-logged-in-user", requireSignIn, getLoggedInUserData)

router.get("/check-user", requireSignIn, checkIsUser);

router.get("/logout", requireSignIn, logout)

module.exports = router;
