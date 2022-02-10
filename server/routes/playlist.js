const express = require("express");
const router = express.Router();
const { requireSignIn, checkUser } = require("../controllers/auth");
const {
    create,
    getPlaylists,
    getUserPlaylists,
    canManagePlaylist,
    deletePlaylist,
    getPlaylist,
    getViewPlaylistVideos,
    getPlaylistInformation,
    editPlaylist,
    getPlaylistVideos,
    publish,
    uploadContent,
} = require("../controllers/playlist");
const { createValidator, updatePlaylistValidator } = require("../validators/playlist");
const {uploadVideoValidator} = require("../validators/video");

router.post("/playlist/create", requireSignIn, checkUser, createValidator, create);

router.post("/playlist/playlists", requireSignIn, checkUser, getPlaylists);

router.post("/playlist/get-user-playlists", requireSignIn, checkUser, getUserPlaylists);

router.delete("/playlist/:id", requireSignIn, checkUser, canManagePlaylist, deletePlaylist);

router.get("/view-playlist/:id", requireSignIn, checkUser, getPlaylist)

router.get("/view-playlist/videos/:id", requireSignIn, checkUser, getViewPlaylistVideos)

router.get(
    "/playlist/edit/:id",
    requireSignIn,
    checkUser,
    canManagePlaylist,
    getPlaylistInformation
);

router.put(
    "/playlist/edit/:id",
    requireSignIn,
    checkUser,
    canManagePlaylist,
    updatePlaylistValidator,
    editPlaylist
);

router.get("/playlist/videos/:id", requireSignIn, checkUser, canManagePlaylist, getPlaylistVideos);

router.put("/playlist/publish", requireSignIn, checkUser, canManagePlaylist, publish);

router.post("/playlist/upload-content", requireSignIn, checkUser, canManagePlaylist, uploadVideoValidator, uploadContent);

module.exports = router;
