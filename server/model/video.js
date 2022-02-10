const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
        default: "",
        max: 512,
    },
    video: {},
    video_length: Number,
    image: {
        key: String,
        url: String,
    },
    uploadedBy: {
        type: ObjectId,
        ref: "User"
    },
    like: [{
        type: ObjectId,
        ref: "User",
    }],
    view: {
        type: Number,
        default: 0,
    },
    playlist: {
        type: ObjectId,
        default: null,
        ref: "Playlist"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Video", videoSchema);