const express = require("express");
const router = express.Router();
const { requireSignIn, checkUser } = require("../controllers/auth");
const {
    canAccessVideo,
    canLinkAndUnlikeVideo,
    uploadVideo,
    uploadedVideoAndDelete,
    uploadContent,
    myVideos,
    getAnotherChannelVideo,
    singleVideo,
    recommendedVideos,
    homepageRecommendedVideos,
    homepageVideos,
    like,
    unlike,
    deleteVideo,
    getVideoInformation,
    updateVideo,
    watchLater,
    removeFromWatchLater,
    search,
    searchPage,
    getWatchLaterVideos,
    getHistory
} = require("../controllers/video");
const { uploadVideoValidator, updateVideoValidator } = require("../validators/video");
const formidable = require("express-formidable");

router.post("/video/upload-video", requireSignIn, formidable(), uploadVideo);

router.post("/video/upload-content", requireSignIn, checkUser, uploadVideoValidator, uploadContent);

router.post("/video/videos", requireSignIn, checkUser, myVideos);

router.post("/video/get-user-videos", requireSignIn, checkUser, getAnotherChannelVideo);

router.get("/video/:id", requireSignIn, checkUser, canAccessVideo, singleVideo);

router.delete("/video/:id", requireSignIn, checkUser, deleteVideo);

router.get("/video/edit/:id", requireSignIn, checkUser, canAccessVideo, getVideoInformation);

router.put("/video/update", requireSignIn, checkUser, canAccessVideo, updateVideoValidator, updateVideo)

router.post("/video/recommended-video", requireSignIn, checkUser, recommendedVideos);

router.get("/home/video/recommend-videos", requireSignIn, checkUser, homepageRecommendedVideos)

router.post("/home/videos", requireSignIn, checkUser, homepageVideos)

router.post("/video/like", requireSignIn, checkUser, canLinkAndUnlikeVideo, like);

router.post("/video/unlike", requireSignIn, checkUser, canLinkAndUnlikeVideo, unlike);

router.put("/video/watch-later", requireSignIn, checkUser, canLinkAndUnlikeVideo, watchLater);

router.put("/video/remove-watch-later", requireSignIn, checkUser, canLinkAndUnlikeVideo, removeFromWatchLater);

router.post("/video/search", requireSignIn, checkUser, search);

router.post("/video/search-page", requireSignIn, checkUser, searchPage);

router.post("/video/watch-later-videos", requireSignIn, checkUser, getWatchLaterVideos);

router.post("/video/history", requireSignIn, checkUser, getHistory);

module.exports = router;
