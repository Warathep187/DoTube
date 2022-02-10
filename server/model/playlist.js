const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const playlistSchema = new mongoose.Schema({
    title: String,
    image: {
        key: String,
        url: String,
    },
    description: {
        type: String,
        max: 512
    },
    createdBy: {
        type: ObjectId,
        ref: "User"
    },
    paid: {
        type: Boolean,
        default: false
    },
    price: {
        type: Number,
        default: 0
    },
    bought: {
        type: Number,
        default: 0
    },
    published: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model("Playlist", playlistSchema);