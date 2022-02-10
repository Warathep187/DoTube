const express = require("express");
const router = express.Router();
const { requireSignIn } = require("../controllers/auth");
const {
    checkAdmin,
    checkIsAdmin,
    getAllUsers,
    userChannel,
    channelVideos,
    channelPlaylists,
    deleteChannel,
    singleVideo,
    deleteVideo,
    comments,
    deleteComment,
    search,
    searchPage,
    getPlaylistInfo,
    getPlaylistVideos,
    deletePlaylist,
    payments,
    cancelPayment,
    confirmPayment
} = require("../controllers/admin");

router.get("/admin/check-admin", requireSignIn, checkIsAdmin);

router.post("/admin/get-all-users", requireSignIn, checkAdmin, getAllUsers);

router.get("/admin/channel/:id", requireSignIn, checkAdmin, userChannel);

router.get("/admin/channel-videos/:id", requireSignIn, checkAdmin, channelVideos);

router.get("/admin/channel-playlists/:id", requireSignIn, checkAdmin, channelPlaylists);

router.delete("/admin/channel/:id", requireSignIn, checkAdmin, deleteChannel);

router.get("/admin/watch/:v", requireSignIn, checkAdmin, singleVideo);

router.delete("/admin/delete-video/:id", requireSignIn, checkAdmin, deleteVideo);

router.post("/admin/comments/:id", requireSignIn, checkAdmin, comments);

router.delete("/admin/delete-comment/:id", requireSignIn, checkAdmin, deleteComment);

router.post("/admin/search", requireSignIn, checkAdmin, search);

router.post("/admin/search-page", requireSignIn, checkAdmin, searchPage)

router.get("/admin/playlist/:id", requireSignIn, checkAdmin, getPlaylistInfo);

router.get("/admin/get-playlist-videos/:id", requireSignIn, checkAdmin, getPlaylistVideos);

router.delete("/admin/delete-playlist/:id", requireSignIn, checkAdmin, deletePlaylist);

router.get("/admin/waiting-payments", requireSignIn, checkAdmin, payments);

router.put("/admin/cancel-payment", requireSignIn, checkAdmin, cancelPayment);

router.put("/admin/confirm-payment", requireSignIn, checkAdmin, confirmPayment);

module.exports = router;
