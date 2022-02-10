const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const paymentSchema = new mongoose.Schema(
    {
        owner_playlist: {
            type: ObjectId,
            ref: "User",
        },
        playlist: {
            type: ObjectId,
            ref: "Playlist",
        },
        buyer: {
            type: ObjectId,
            ref: "User",
        },
        slip_image: {
            url: String,
            key: String,
        },
        confirm: {
            type: Boolean,
            default: false,
        },
        cancel: {
            type: Boolean,
            default: false
        },
        reason: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Payment", paymentSchema);
