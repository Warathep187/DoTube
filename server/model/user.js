const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            trim: true,
            unique: true,
            index: true,
        },
        name: {
            type: String,
            trim: true,
        },
        password: String,
        role: {
            type: String,
            default: "user"
        },
        profile_image: {
            key: {
                type: String,
                default: "",
            },
            url: {
                type: String,
                default: "/static/images/unknown-profile.jpg"
            }
        },
        subscribers: [
            {
                type: ObjectId,
                ref: "User"
            },
        ],
        seller: {
            type: Boolean,
            default: false,
        },
        account_name: {
            type: String,
            default: "",
            trim: true,
        },
        bank: {
            type: String,
            default: "",
            enum: ["", "Kasikorn", "Krung Thai", "Bangkok"],
            trim: true,
        },
        bank_number: {
            type: String,
            default: "",
            trim: true,
        },
        reset_password_otp: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
