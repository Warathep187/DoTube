const express = require("express");
const router = express.Router();
const { requireSignIn, checkUser } = require("../controllers/auth");
const { commentValidator } = require("../validators/comment");
const { canViewComments, comment, getComments, like, unlike, deleteComment } = require("../controllers/comment");

router.post("/comment", requireSignIn, checkUser, commentValidator, comment);

router.post("/comments", requireSignIn, checkUser, canViewComments, getComments);

router.put("/comment/like", requireSignIn, checkUser, canViewComments, like);

router.put("/comment/unlike", requireSignIn, checkUser, canViewComments, unlike);

router.delete("/comment/:id", requireSignIn, checkUser, deleteComment)

module.exports = router