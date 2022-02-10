const Notification = require("../model/notification");
const Playlist = require("../model/playlist");
const Action = require("../model/action");
const Payment = require("../model/payment");
const aws = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

exports.createPayment = (req, res) => {
    const { _id } = req.user;
    const { playlistId, image } = req.body;
    if (!image) {
        return res.status(400).send("Slip image is required");
    }
    Playlist.findById(playlistId)
        .select("paid published createdBy")
        .exec((err, playlist) => {
            if (!playlist) {
                return res.status(404).send("Playlist not  found");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (!playlist.paid) {
                return res.status(400).send("Playlist is free");
            }
            if (!playlist.published) {
                return res.status(403).send("Playlist is not publish yet");
            }
            if (playlist.createdBy == _id) {
                return res.status(400).send("You are already the owner of the playlist.");
            }
            Payment.findOne({playlist: playlistId, buyer: _id}).select("_id").exec((err, payment) => {
                if(err) {
                    return res.status(400).send("Something went wrong");
                }
                if(payment) {
                    return res.status(403).send("You are already bought this playlist");
                }
                Action.findOne({ user: _id })
                .select("purchased")
                .exec((err, action) => {
                    if (err) {
                        return res.status(400).send("Something went wrong");
                    }
                    if (action.purchased.includes(playlistId)) {
                        return res.status(400).send("You already bought thi playlist");
                    }
                    const newPayment = new Payment({
                        owner_playlist: playlist.createdBy,
                        playlist: playlistId,
                        buyer: _id,
                    });
                    const base64image = new Buffer.from(
                        image.replace(/^data:image\/\w+;base64,/, ""),
                        "base64"
                    );
                    const type = image.split(";")[0].split("/")[1];
                    const params = {
                        Bucket: "dotube-imagestorage",
                        Key: `payment-image/${uuidv4()}.${type}`,
                        Body: base64image,
                        ACL: "public-read",
                        ContentEncoding: "base64",
                        ContentType: "image/" + type,
                    };
                    s3.upload(params, (err, uploaded) => {
                        if (err) {
                            return res.status(400).send("Could not upload image");
                        }
                        newPayment.slip_image.url = uploaded.Location;
                        newPayment.slip_image.key = uploaded.Key;
                        newPayment.save((er, saved) => {
                            if (err) {
                                return res.status(400).send("Could not create new payment");
                            }
                            res.json({
                                message:
                                    "Payment created successfully. Please wait admin to confirm your payment",
                            });
                        });
                    });
                });
            })
        });
};

exports.getProcessing = (req, res) => {
    const { _id } = req.user;
    Payment.find({ buyer: _id, confirm: false })
        .select("-owner_playlist -updatedAt")
        .populate("playlist", "_id title image price createdAt")
        .sort({ createdAt: -1 })
        .exec((err, playlists) => {
            if (err) {
                return res.status(400).send("Could not get your processing");
            }
            res.json(playlists);
        });
};

exports.getPurchased = (req, res) => {
    const { _id } = req.user;
    Action.findOne({ user: _id })
        .select("-_id purchased")
        .populate("purchased", "_id title image")
        .exec((err, data) => {
            if (err) {
                return res.status(400).send("Could not get purchased list");
            }
            const newOrderPlaylist = [];
            for (let i = data.purchased.length - 1; i >= 0; i--) {
                newOrderPlaylist.push(data.purchased[i]);
            }
            res.json({
                playlists: newOrderPlaylist,
            });
        });
};

exports.getSelling = (req, res) => {
    const { _id } = req.user;
    Payment.find({ owner_playlist: _id, confirm: true, cancel: false })
        .select("buyer playlist updatedAt")
        .populate("buyer", "_id name profile_image")
        .populate("playlist", "_id title")
        .sort({updatedAt: -1})
        .exec((err, payments) => {
            if(err) {
                return res.status(400).send("Could not get payment selling");
            }
            res.json(payments);
        });
};
