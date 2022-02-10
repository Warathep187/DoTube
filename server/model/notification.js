const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema

const notificationSchema = new mongoose.Schema({
    from_user: {
        type: ObjectId,
        ref: "User"
    },
    to_user: {
        type: ObjectId,
        ref: "User"
    },
    type: {
        type: String,
        enum: ["like", "comment", "subscribe", "like_comment", "alert_video", "alert_playlist"]
    },
    playlist_id: {
        type: ObjectId,
        ref: "Playlist",
        default: null,
    },
    video_id: {
        type: ObjectId,
        ref: "Video",
        default: null
    },
    comment_id: {
        type: ObjectId,
        ref: "Comment",
        default: null
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Notification", notificationSchema);