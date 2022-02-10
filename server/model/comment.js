const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        trim: true,
        max: 128,
    },
    commentedBy: {
        type: ObjectId,
        ref: "User",
    },
    like: [{ type: ObjectId, ref: "User" }],
    video: {
        type: ObjectId,
        ref: "Video"
    }
}, {timestamps: true});

module.exports = mongoose.model("Comment", commentSchema);