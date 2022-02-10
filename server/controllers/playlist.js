const Playlist = require("../model/playlist");
const Video = require("../model/video");
const User = require("../model/user");
const Comment = require("../model/comment");
const Payment = require("../model/payment");
const Notification = require("../model/notification");
const Action = require("../model/action");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

exports.canManagePlaylist = (req, res, next) => {
    const { _id } = req.user;
    const id = req.params.id || req.body.id;
    Playlist.findOne({ _id: id })
        .select("createdBy")
        .exec((err, playlist) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (!playlist) {
                return res.status(404).send("Playlist not found");
            }
            if (playlist.createdBy != _id) {
                return res.status(403).send("You can not manage this playlist");
            }
            next();
        });
};

exports.create = (req, res) => {
    const { _id } = req.user;
    const { title, description, image, paid, price } = req.body;
    if (paid) {
        User.findById(_id)
            .select("bank")
            .exec((err, user) => {
                if (err) {
                    return res.status(400).send("Something went wrong");
                }
                if (user.bank === "") {
                    return res.json({
                        redirect: true,
                    });
                }
                const newPlaylist = new Playlist({
                    title,
                    description,
                    createdBy: _id,
                    paid,
                    price,
                });
                const base64image = new Buffer.from(
                    image.replace(/^data:image\/\w+;base64,/, ""),
                    "base64"
                );
                const type = image.split(";")[0].split("/")[1];
                const params = {
                    Bucket: "dotube-imagestorage",
                    Key: `playlist-image/${uuidv4()}.${type}`,
                    Body: base64image,
                    ACL: "public-read",
                    ContentEncoding: "base64",
                    ContentType: "image/" + type,
                };
                s3.upload(params, (err, result) => {
                    if (err) {
                        return res.status(400).send("Could not upload image");
                    }
                    newPlaylist.image.url = result.Location;
                    newPlaylist.image.key = result.Key;
                    result.description = undefined;
                    newPlaylist.save((err, result) => {
                        if (err) {
                            return res.status(400).send("Could not create a playlist");
                        }
                        res.status(201).json({ message: "Created successfully", playlist: result });
                    });
                });
            });
    } else {
        const newPlaylist = new Playlist({ title, description, createdBy: _id, paid, price });
        const base64image = new Buffer.from(
            image.replace(/^data:image\/\w+;base64,/, ""),
            "base64"
        );
        const type = image.split(";")[0].split("/")[1];
        const params = {
            Bucket: "dotube-imagestorage",
            Key: `playlist-image/${uuidv4()}.${type}`,
            Body: base64image,
            ACL: "public-read",
            ContentEncoding: "base64",
            ContentType: "image/" + type,
        };
        s3.upload(params, (err, result) => {
            if (err) {
                return res.status(400).send("Could not upload image");
            }
            newPlaylist.image.url = result.Location;
            newPlaylist.image.key = result.Key;
            result.description = undefined;
            newPlaylist.save((err, result) => {
                if (err) {
                    return res.status(400).send("Could not create a playlist");
                }
                res.status(201).json({ message: "Created successfully", playlist: result });
            });
        });
    }
};

exports.getPlaylists = (req, res) => {
    const { _id } = req.user;
    const { limit, skip } = req.body;
    Playlist.find({ createdBy: _id })
        .select("-description")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .exec((err, playlists) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            res.json(playlists);
        });
};

exports.getUserPlaylists = (req, res) => {
    const { id } = req.body;
    Playlist.find({ createdBy: id, published: true })
        .select("-description")
        .sort({ createdAt: -1 })
        .exec((err, playlists) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            res.json(playlists);
        });
};

exports.deletePlaylist = (req, res) => {
    const { id } = req.params;
    Playlist.findById(id)
        .select("image paid")
        .exec((err, playlist) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            Playlist.deleteOne({ _id: id }).exec((err, deleted) => {
                if (err) {
                    return res.status(400).send("Could not delete this playlist");
                }
                Video.find({ playlist: id })
                    .select("_id image video")
                    .exec((err, videos) => {
                        if (err) {
                            return res.status(400).send("Something went wrong");
                        }
                        const videoImagesArray = videos.map((video, index) => video.image.key);
                        const videosArray = videos.map((video, index) => video.video.key);
                        const videosIdArray = videos.map((video, index) => video._id);
                        Video.deleteMany({ playlist: id }).exec((err, success) => {
                            if (err) {
                                return res
                                    .status(400)
                                    .send("Could not delete videos in this playlist");
                            }
                            res.json({ ok: true });
                            const deleteParams = {
                                Bucket: "dotube-imagestorage",
                                Key: playlist.image.key,
                            };
                            s3.deleteObject(deleteParams, (err, deleted) => {
                                if (err) {
                                    console.log(err);
                                }
                                for (key of videoImagesArray) {
                                    const params = {
                                        Bucket: "dotube-imagestorage",
                                        Key: key,
                                    };
                                    s3.deleteObject(params, (err, deleted) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                }
                                for (key of videosArray) {
                                    const params = {
                                        Bucket: "dotube-imagestorage",
                                        Key: key,
                                    };
                                    s3.deleteObject(params, (err, deleted) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                }
                                Notification.deleteMany({
                                    $or: [
                                        { video_id: { $in: videosIdArray } },
                                        { playlist_id: id },
                                    ],
                                }).exec((err, deleted) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    Comment.deleteMany({ video: { $in: videosIdArray } }).exec(
                                        (err, deleted) => {
                                            if (err) {
                                                console.log(err);
                                            }
                                            if (playlist.paid) {
                                                Payment.updateMany(
                                                    { playlist: id, confirm: false },
                                                    {
                                                        cancel: true,
                                                        reason: "Playlist has been deleted, Admin will transfer your money back soon.",
                                                    }
                                                ).exec((err, updated) => {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    Action.updateMany(
                                                        { purchased: id },
                                                        { $pull: { purchased: id } }
                                                    ).exec((err, updated) => {
                                                        if (err) {
                                                            console.log(err);
                                                        }
                                                    });
                                                });
                                            }
                                        }
                                    );
                                });
                            });
                        });
                    });
            });
        });
};

exports.getPlaylist = (req, res) => {
    const { _id } = req.user;
    const { id } = req.params;
    Playlist.findById(id)
        .select("title description image createdBy paid price published createdAt bought")
        .populate("createdBy", "_id profile_image name")
        .exec((err, playlist) => {
            if (!playlist) {
                return res.status(404).send("Playlist not found");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (_id == playlist.createdBy._id) {
                return res.json({ playlist });
            }
            if (playlist.published) {
                if (playlist.paid) {
                    Payment.findOne({ playlist: playlist._id, buyer: _id, confirm: false })
                        .select("_id")
                        .exec((err, payment) => {
                            if (err) {
                                return res.status(400).send("Something went wrong");
                            }
                            if (payment) {
                                return res.status(200).json({
                                    playlist,
                                    isWaiting: true,
                                });
                            }
                            Action.findOne({ user: _id })
                                .select("purchased")
                                .exec((err, action) => {
                                    if (err) {
                                        return res.status(400).send("Something went wrong");
                                    }
                                    if (action.purchased.includes(id)) {
                                        res.status(200).json({
                                            playlist,
                                            purchased: true,
                                        });
                                    } else {
                                        res.status(200).json({
                                            playlist,
                                            purchased: false,
                                        });
                                    }
                                });
                        });
                } else {
                    res.json({ playlist });
                }
            } else {
                res.status(403).send("Playlist is not publish");
            }
        });
};

exports.getViewPlaylistVideos = (req, res) => {
    const { _id } = req.user;
    const { id } = req.params;
    Playlist.findById(id)
        .select("paid published createdBy")
        .exec((err, playlist) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (playlist.published || _id == playlist.createdBy) {
                Video.find({ playlist: id })
                    .select("_id uploadedBy image title video_length view createdAt")
                    .sort({ createdAt: -1 })
                    .exec((err, videos) => {
                        if (err) {
                            return res.status(400).send("Something went wrong");
                        }
                        res.json(videos);
                    });
            } else {
                res.status(403).send("Playlist is not publish");
            }
        });
};

exports.getPlaylistInformation = (req, res) => {
    const { id } = req.params;
    Playlist.findById(id)
        .select("-createdBy -bought -createdAt -updatedAt")
        .exec((err, playlist) => {
            if (!playlist) {
                return res.status(404).send("Playlist not found");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            const imagePreview = JSON.parse(JSON.stringify(playlist.image));
            playlist.image = undefined;
            res.json({
                playlist,
                imagePreview,
            });
        });
};

exports.editPlaylist = (req, res) => {
    const { _id } = req.user;
    const { id } = req.params;
    const { title, description, image, paid, price } = req.body;
    if (paid) {
        User.findById(_id)
            .select("bank")
            .exec((err, user) => {
                if (err) {
                    return res.status(400).send("Something went wrong");
                }
                if (user.bank === "") {
                    return res.json({ redirect: true });
                }
                if (image) {
                    const base64image = new Buffer.from(
                        image.replace(/^data:image\/\w+;base64,/, ""),
                        "base64"
                    );
                    const type = image.split(";")[0].split("/")[1];
                    const params = {
                        Bucket: "dotube-imagestorage",
                        Key: `playlist-image/${uuidv4()}.${type}`,
                        Body: base64image,
                        ACL: "public-read",
                        ContentEncoding: "base64",
                        ContentType: "image/" + type,
                    };
                    s3.upload(params, (err, result) => {
                        if (err) {
                            return res.status(400).send("Could not upload the image");
                        }
                        const updatedImage = {
                            key: result.Key,
                            url: result.Location,
                        };
                        Playlist.findOneAndUpdate(
                            { _id: id },
                            { title, description, image: updatedImage, paid, price }
                        ).exec((err, success) => {
                            if (err) {
                                return res.status(400).send("Could not update playlist");
                            }
                            res.status(202).json({
                                updatedImage,
                            });
                            const deleteParams = {
                                Bucket: "dotube-imagestorage",
                                Key: success.image.key,
                            };
                            s3.deleteObject(deleteParams, (err, deleted) => {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        });
                    });
                } else {
                    Playlist.updateOne({ _id: id }, { title, description, paid, price }).exec(
                        (err, updated) => {
                            if (err) {
                                return res.status(400).send("Could not update playlist");
                            }
                            res.status(201).json({ message: "Updated successfully" });
                        }
                    );
                }
            });
    } else {
        if (image) {
            const base64image = new Buffer.from(
                image.replace(/^data:image\/\w+;base64,/, ""),
                "base64"
            );
            const type = image.split(";")[0].split("/")[1];
            const params = {
                Bucket: "dotube-imagestorage",
                Key: `playlist-image/${uuidv4()}.${type}`,
                Body: base64image,
                ACL: "public-read",
                ContentEncoding: "base64",
                ContentType: "image/" + type,
            };
            s3.upload(params, (err, result) => {
                if (err) {
                    return res.status(400).send("Could not upload the image");
                }
                const updatedImage = {
                    key: result.Key,
                    url: result.Location,
                };
                Playlist.findOneAndUpdate(
                    { _id: id },
                    { title, description, image: updatedImage, paid, price }
                ).exec((err, success) => {
                    if (err) {
                        return res.status(400).send("Could not update playlist");
                    }
                    res.status(202).json({
                        updatedImage,
                    });
                    const deleteParams = {
                        Bucket: "dotube-imagestorage",
                        Key: success.image.key,
                    };
                    s3.deleteObject(deleteParams, (err, deleted) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                });
            });
        } else {
            Playlist.updateOne({ _id: id }, { title, description, paid, price }).exec(
                (err, updated) => {
                    if (err) {
                        return res.status(400).send("Could not update playlist");
                    }
                    res.status(201).json({ message: "Updated successfully" });
                }
            );
        }
    }
};

exports.getPlaylistVideos = (req, res) => {
    const { _id } = req.user;
    const { id } = req.params;
    Video.find({ playlist: id, uploadedBy: _id })
        .sort({ createdAt: -1 })
        .select("title image video_length view createdAt")
        .exec((err, videos) => {
            if (err) {
                return res.status(400).send("Could not get videos");
            }
            res.json(videos);
        });
};

exports.publish = (req, res) => {
    const { _id } = req.user;
    const { id } = req.body;
    Playlist.findByIdAndUpdate({ _id: id }, { published: true })
        .select("_id")
        .exec((err, success) => {
            if (err) {
                return res.status(400).send("Could not publish this playlist");
            }
            res.json({ message: "Published successfully. Everyone can see your playlist" });
            Action.find({ alert: { $in: _id } })
                .select("user")
                .exec((err, users) => {
                    if (err) {
                        console.log(err);
                    }
                    const usersArray = users.map((user, index) => user.user);
                    for (usersId of usersArray) {
                        const newAlert = new Notification({
                            to_user: usersId,
                            from_user: _id,
                            type: "alert_playlist",
                            playlist_id: success._id,
                        });
                        newAlert.save((err, success) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                });
        });
};

exports.uploadContent = (req, res) => {
    const { _id } = req.user;
    const { title, description, video, sec, image, id } = req.body;

    const newVideo = new Video({
        title,
        description,
        video,
        video_length: sec,
        playlist: id,
        uploadedBy: _id,
        like: [],
    });

    const base64image = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64");
    const type = image.split(";")[0].split("/")[1];
    const params = {
        Bucket: "dotube-imagestorage",
        Key: `cover-clip-image/${uuidv4()}.${type}`,
        Body: base64image,
        ACL: "public-read",
        ContentEncoding: "base64",
        ContentType: "image/" + type,
    };
    s3.upload(params, (err, success) => {
        if (err) {
            return res.status(400).send("Could not upload video image.");
        }
        newVideo.image.key = success.Key;
        newVideo.image.url = success.Location;
        newVideo.save((err, saved) => {
            if (err) {
                return res.status(400).send("Could not create new video");
            }
            saved.description = undefined;
            saved.video = undefined;
            saved.uploadedBy = undefined;
            saved.like = undefined;
            saved.playlist = undefined;
            saved.updatedAt = undefined;
            saved.__v = undefined;
            res.json({ message: "Uploaded", newVideo: saved });
        });
    });
};
