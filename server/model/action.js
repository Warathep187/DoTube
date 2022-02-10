const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const actionSchema = new mongoose.Schema({
    user: {
        type: ObjectId,
        ref: "User",
    },
    subscriptions: [
        {
            type: ObjectId,
            ref: "User",
        },
    ],
    purchased: [
        {
            type: ObjectId,
            ref: "Playlist",
        },
    ],
    alert: [
        {
            type: ObjectId,
            ref: "User",
        },
    ],
    history: [
        {
            type: ObjectId,
            ref: "Video",
        },
    ],
    watch_later: [
        {
            type: ObjectId,
            ref: "Video",
        },
    ],
});

module.exports = mongoose.model("Actions", actionSchema);
