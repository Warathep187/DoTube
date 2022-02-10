const User = require("../model/user");
const Video = require("../model/video");
const Playlist = require("../model/playlist");
const Action = require("../model/action");
const Notification = require("../model/notification");
const AWS = require("aws-sdk");
const { nanoid } = require("nanoid");
const { readFileSync } = require("fs");
const { v4: uuidv4 } = require("uuid");
const { getVideoDurationInSeconds } = require("get-video-duration");

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

exports.canAccessVideo = (req, res, next) => {
    const { _id } = req.user;
    const videoId = req.params.id || req.body.v;
    Video.findById(videoId)
        .select("playlist uploadedBy")
        .populate("playlist", "paid published")
        .exec((err, video) => {
            if (!video) {
                return res.status(404).send("Video not found");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (video.uploadedBy == _id) {
                return next();
            }
            if (!video.playlist) {
                next();
            } else {
                if (!video.playlist.published) {
                    res.status(403).send("Video is not publish");
                } else {
                    next();
                }
            }
        });
};

exports.canLinkAndUnlikeVideo = (req, res, next) => {
    const { _id } = req.user;
    const { v } = req.body;
    Video.findById(v)
        .select("playlist uploadedBy")
        .populate("playlist", "paid published")
        .exec((err, video) => {
            if (video.playlist) {
                if (video.playlist.published) {
                    if (video.playlist.paid) {
                        Action.findOne({ user: _id })
                            .select("purchased")
                            .exec((err, user) => {
                                if (
                                    user.purchased.includes(video.playlist._id) ||
                                    _id == video.uploadedBy
                                ) {
                                    next();
                                } else {
                                    res.status(403).send("You can not like this video.");
                                }
                            });
                    } else {
                        next();
                    }
                } else {
                    res.status(403).send("Video is not publish");
                }
            } else {
                next();
            }
        });
};

exports.uploadVideo = (req, res) => {
    const { video } = req.files;
    const params = {
        Bucket: "dotube-imagestorage",
        Key: `video/${nanoid(16)}.${video.type.split("/")[1]}`,
        Body: readFileSync(video.path),
        ACL: "public-read",
        ContentType: video.type,
    };
    s3.upload(params, async (err, result) => {
        if (err) {
            return res.status(400).send("Could not upload video.");
        }
        const length = await getVideoDurationInSeconds(result.Location);
        const sec = parseInt(length);
        res.json({ ...result, sec });
    });
};

exports.uploadContent = (req, res) => {
    const { _id } = req.user;
    const { title, description, video, sec, image } = req.body;
    const newVideo = new Video({
        title,
        description,
        video,
        video_length: sec,
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
    s3.upload(params, (err, uploaded) => {
        if (err) {
            console.log(err);
            return res.status(400).send("Something went wrong");
        }
        newVideo.image.key = uploaded.Key;
        newVideo.image.url = uploaded.Location;
        newVideo.save((err, result) => {
            if (err) {
                console.log(err);
                return res.status(400).send("Could not upload video");
            }
            result.description = undefined;
            result.video = undefined;
            result.uploadedBy = undefined;
            result.like = undefined;
            result.playlist = undefined;
            result.updatedAt = undefined;
            result.__v = undefined;
            res.json({
                message: "Uploaded",
                video: result,
            });
            Action.find({ alert: { $in: _id } })
                .select("user")
                .exec((err, users) => {
                    if (err) {
                        console.log(err);
                    }
                    const usersArray = users.map((user, index) => user.user);
                    for (id of usersArray) {
                        const newAlert = new Notification({
                            to_user: id,
                            from_user: _id,
                            type: "alert_video",
                            video_id: result._id,
                        });
                        newAlert.save((err, success) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                });
        });
    });
};

exports.getVideos = (req, res) => {
    const { _id } = req.user;
    Video.find({ uploadedBy: _id, playlist: null })
        .sort({ createdAt: -1 })
        .select("_id title image video_length view createdAt")
        .exec((err, videos) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            res.json(videos);
        });
};

exports.myVideos = (req, res) => {
    const { _id } = req.user;
    const { limit, skip } = req.body;
    Video.find({ uploadedBy: _id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .select("_id title image video_length view createdAt")
        .exec((err, videos) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            res.json(videos);
        });
};

exports.getAnotherChannelVideo = (req, res) => {
    const { userId, limit, skip } = req.body;
    Playlist.find({ createdBy: userId, published: true, paid: false })
        .select("_id")
        .exec((err, playlists) => {
            const playlistIds = playlists.map((playlist, index) => playlist._id);
            playlistIds.push(null);
            Video.find({ uploadedBy: userId, playlist: { $in: playlistIds } })
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip)
                .select("_id title image video_length view createdAt")
                .exec((err, videos) => {
                    if (err) {
                        return res.status(400).send("Something went wrong");
                    }
                    res.json(videos);
                });
        });
};

exports.singleVideo = (req, res) => {
    const { id } = req.params;
    const { _id } = req.user;
    Action.findOne({ user: _id }).exec((err, user) => {
        if (err) {
            return res.status(400).send("Something went wrong");
        }
        Video.findById(id)
            .populate("uploadedBy", "_id profile_image name subscribers")
            .populate("playlist", "_id title description paid price bought")
            .exec((err, video) => {
                if (err) {
                    return res.status(400).send("Something went wrong");
                }
                if (!video) {
                    return res.status(404).send("Video not found");
                }
                let isLike = false;
                let isSave = false;
                if (video.like.includes(_id)) {
                    isLike = true;
                }
                if (user.watch_later.includes(id)) {
                    isSave = true;
                }
                const subscribers = video.uploadedBy.subscribers;
                let isSubscribed = false;
                if (subscribers.includes(_id)) {
                    isSubscribed = true;
                }
                if (!video.playlist || !video.playlist.paid) {
                    res.json({
                        title: video.title,
                        description: video.description,
                        videoLink: video.video.url,
                        uploadedBy: video.uploadedBy,
                        like: video.like.length,
                        isLike,
                        isSave,
                        view: video.view,
                        playlist: video.playlist,
                        createdAt: video.createdAt,
                        isSubscribed,
                        blocked: false,
                    });
                    Video.updateOne({ _id: id }, { $inc: { view: 1 } }).exec((err, updated) => {
                        Action.findOneAndUpdate(
                            { user: _id },
                            { $pull: { history: id } },
                            { new: true }
                        )
                            .select("history")
                            .exec((err, updated) => {
                                if (err) {
                                    console.log(err);
                                }
                                if (updated.history.length > 39) {
                                    const newArray = updated.history.slice(1);
                                    newArray.push(id);
                                    Action.updateOne({ user: _id }, { history: newArray }).exec(
                                        (err, updated) => {
                                            if (err) {
                                                console.log(err);
                                            }
                                        }
                                    );
                                } else {
                                    Action.updateOne(
                                        { user: _id },
                                        { $push: { history: id } }
                                    ).exec((err, updated) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                }
                            });
                    });
                } else {
                    if (video.playlist.paid) {
                        if (user.purchased.includes(video.playlist._id)) {
                            res.json({
                                title: video.title,
                                description: video.description,
                                videoLink: video.video.url,
                                uploadedBy: video.uploadedBy,
                                like: video.like.length,
                                isLike,
                                isSave,
                                view: video.view,
                                playlist: video.playlist,
                                createdAt: video.createdAt,
                                isSubscribed,
                                purchased: true,
                                blocked: false,
                            });
                            Video.updateOne({ _id: id }, { $inc: { view: 1 } }).exec(
                                (err, updated) => {
                                    Action.findOneAndUpdate(
                                        { user: _id },
                                        { $pull: { history: id } },
                                        { new: true }
                                    )
                                        .select("history")
                                        .exec((err, updated) => {
                                            if (err) {
                                                console.log(err);
                                            }
                                            if (updated.history.length > 39) {
                                                const newArray = updated.history.slice(1);
                                                newArray.push(id);
                                                Action.updateOne(
                                                    { user: _id },
                                                    { history: newArray }
                                                ).exec((err, updated) => {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                });
                                            } else {
                                                Action.updateOne(
                                                    { user: _id },
                                                    { $push: { history: id } }
                                                ).exec((err, updated) => {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                });
                                            }
                                        });
                                }
                            );
                        } else if (video.uploadedBy._id == _id) {
                            res.json({
                                title: video.title,
                                description: video.description,
                                videoLink: video.video.url,
                                uploadedBy: video.uploadedBy,
                                like: video.like.length,
                                isLike,
                                isSave,
                                view: video.view,
                                playlist: video.playlist,
                                createdAt: video.createdAt,
                                isSubscribed,
                                blocked: false,
                            });
                        } else {
                            res.json({
                                title: video.title,
                                uploadedBy: video.uploadedBy,
                                playlist: video.playlist,
                                isSubscribed,
                                blocked: true,
                            });
                        }
                    }
                }
            });
    });
};

exports.getVideoInformation = (req, res) => {
    const { id } = req.params;
    Video.findById(id)
        .select("title description image")
        .exec((err, video) => {
            if (!video) {
                return res.status(404).send("Video not found");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            res.json(video);
        });
};

exports.updateVideo = (req, res) => {
    const { v, title, description, image } = req.body;
    Video.findById(v)
        .select("image")
        .exec((err, video) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (image) {
                const base64image = new Buffer.from(
                    image.replace(/^data:image\/\w+;base64,/, ""),
                    "base64"
                );
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
                        return res.status(400).send("Could not upload image");
                    }
                    const newImage = {
                        key: success.Key,
                        url: success.Location,
                    };
                    Video.updateOne({ _id: v }, { title, description, image: newImage }).exec(
                        (err, updated) => {
                            if (err) {
                                return res.status(400).send("Could not edit video");
                            }
                            res.json({ message: "Video updated successfully", image: newImage });
                            const deleteParams = {
                                Bucket: "dotube-imagestorage",
                                Key: video.image.key,
                            };
                            s3.deleteObject(deleteParams, (err, deleted) => {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    );
                });
            } else {
                Video.updateOne({ _id: v }, { title, description }).exec((err, updated) => {
                    if (err) {
                        return res.status(400).send("Could not edit video");
                    }
                    res.json({ message: "Video updated successfully" });
                });
            }
        });
};

exports.deleteVideo = (req, res) => {
    const { id } = req.params;
    const { _id } = req.user;
    Video.findById(id)
        .select("uploadedBy image video")
        .exec((err, video) => {
            if (err) {
                return res.status(400).send("Could not found video");
            }
            if (!video) {
                return res.status(404).send("Video not found");
            }
            if (video.uploadedBy != _id) {
                return res.status(403).send("You can not delete this video.");
            }
            Video.deleteOne({ _id: id }).exec((err, deleted) => {
                if (err) {
                    return res.status(400).send("Could not delete video");
                }
                res.json({ ok: true });
                Notification.deleteMany({ video_id: id }).exec((err, deleted) => {
                    if (err) {
                        console.log(err);
                    }
                    const deleteImageParams = {
                        Bucket: "dotube-imagestorage",
                        Key: video.image.key,
                    };
                    s3.deleteObject(deleteImageParams, (err, deleted) => {
                        if (err) {
                            console.log(err);
                        }
                        const deleteVideoParams = {
                            Bucket: "dotube-imagestorage",
                            Key: video.video.key,
                        };
                        s3.deleteObject(deleteVideoParams, (err, deleted) => {
                            if (err) {
                                console.log(err);
                            }
                            Comment.deleteMany({ video: id }).exec((err, deleted) => {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        });
                    });
                });
            });
        });
};

exports.recommendedVideos = (req, res) => {
    const { v } = req.body;
    Playlist.find({ published: true, paid: false })
        .select("_id")
        .exec((err, playlists) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            const arrayOfPlaylistIds = playlists.map((playlist, index) => playlist._id);
            arrayOfPlaylistIds.push(null);
            Video.find({ _id: { $ne: v }, playlist: { $in: arrayOfPlaylistIds } })
                .select("_id uploadedBy image title video_length view")
                .populate("uploadedBy", "_id name profile_image")
                .limit(8)
                .sort({ view: -1 })
                .exec((err, videos) => {
                    if (err) {
                        return res.status(400).send("Something went wrong");
                    }
                    res.json(videos);
                });
        });
};

exports.homepageRecommendedVideos = (req, res) => {
    const { _id } = req.user;
    Playlist.find({ published: true, paid: false })
        .select("_id")
        .exec((err, playlists) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            const playlistArray = playlists.map((playlist, index) => playlist._id);
            playlistArray.push(null);
            Video.find({
                uploadedBy: { $ne: _id },
                playlist: { $in: playlistArray },
            })
                .select("title video_length image uploadedBy view createdAt")
                .populate("uploadedBy", "name profile_image")
                .sort({ view: -1 })
                .limit(4)
                .exec((err, videos) => {
                    if (err) {
                        return res.status(400).send("Could not found videos");
                    }
                    res.json(videos);
                });
        });
};

exports.homepageVideos = (req, res) => {
    const { _id } = req.user;
    const { limit, skip } = req.body;
    Action.findOne({ user: _id })
        .select("-_id subscriptions")
        .exec((err, subscription) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            Playlist.find({
                createdBy: { $in: subscription.subscriptions },
                createdBy: { $ne: _id },
                published: true,
                paid: false,
            })
                .select("_id")
                .exec((err, playlists) => {
                    if (err) {
                        return res.status(400).send("Something went wrong");
                    }
                    const playlistArray = playlists.map((p, i) => p._id);
                    playlistArray.push(null);
                    Video.find({
                        uploadedBy: { $in: subscription.subscriptions },
                        playlist: { $in: playlistArray },
                    })
                        .select("title video_length image uploadedBy view createdAt")
                        .populate("uploadedBy", "name profile_image")
                        .sort({ createdAt: -1 })
                        .limit(limit)
                        .skip(skip)
                        .exec((err, videos) => {
                            if (err) {
                                return res.status(400).send("Could not found videos");
                            }
                            res.json(videos);
                        });
                });
        });
};

exports.like = (req, res) => {
    const { _id } = req.user;
    const { v } = req.body;
    Video.findById(v)
        .select("uploadedBy like")
        .exec((err, video) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (video.like.includes(_id)) {
                return res.status(400).send("You already liked this video.");
            }
            Video.updateOne({ _id: v }, { $push: { like: _id } }).exec((err, updated) => {
                if (err) {
                    return res.status(400).send("Could not like this video.");
                }
                res.json({ ok: true });
                if (video.uploadedBy != _id) {
                    const newAlert = new Notification({
                        from_user: _id,
                        to_user: video.uploadedBy,
                        type: "like",
                        video_id: v,
                    });
                    newAlert.save((err, saved) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        });
};

exports.unlike = (req, res) => {
    const { _id } = req.user;
    const { v } = req.body;
    Video.findById(v)
        .select("uploadedBy like")
        .exec((err, video) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (!video.like.includes(_id)) {
                return res.status(400).send("You can not unlike this video.");
            }
            Video.updateOne({ _id: v }, { $pull: { like: _id } }).exec((err, updated) => {
                if (err) {
                    return res.status(400).send("Could not unlike this video.");
                }
                res.json({ ok: true });
                Notification.deleteOne({
                    from_user: _id,
                    to_user: video.uploadedBy,
                    type: "like",
                    video_id: v,
                }).exec((err, deleted) => {
                    if (err) {
                        console.log(err);
                    }
                });
            });
        });
};

exports.watchLater = (req, res) => {
    const { _id } = req.user;
    const { v } = req.body;
    Action.findOne({ user: _id })
        .select("watch_later")
        .exec((err, action) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (action.watch_later.includes(v)) {
                return res.status(400).send("You already saved this video");
            }
            Action.updateOne({ user: _id }, { $push: { watch_later: v } }).exec((err, saved) => {
                if (err) {
                    return res.status(400).send("Could not save this video");
                }
                res.json({ message: "Video saved" });
            });
        });
};

exports.removeFromWatchLater = (req, res) => {
    const { _id } = req.user;
    const { v } = req.body;
    Action.findOne({ user: _id })
        .select("watch_later")
        .exec((err, action) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (!action.watch_later.includes(v)) {
                return res.status(400).send("You never save this video");
            }
            Action.updateOne({ user: _id }, { $pull: { watch_later: v } }).exec((err, saved) => {
                if (err) {
                    return res.status(400).send("Could not remove this video");
                }
                res.json({ message: "Video removed" });
            });
        });
};

exports.search = (req, res) => {
    const key = new RegExp("^" + req.body.key, "i");
    User.find({ name: key, role: { $ne: "admin" } })
        .select("-_id name")
        .limit(3)
        .exec((err, users) => {
            if (err) {
                return res.status(400).send("Could not get users");
            }
            Playlist.find({published: true}).select("_id").exec((err, published) => {
                const publishedIds = published.map(publish => publish._id);
                Playlist.find({_id: {$in: publishedIds}, title: key}).select("-_id title").limit(3).exec((err, playlists) => {
                    if (err) {
                        return res.status(400).send("Could not get playlists");
                    }
                    Video.find({ title: key, playlists: {$in: publishedIds} })
                    .select("-_id title")
                    .limit(5)
                    .exec((err, videos) => {
                        if (err) {
                            return res.status(400).send("Could not get videos");
                        }
                        res.json([...users, ...playlists, ...videos]);
                    });
                })
            })
        });
};

exports.searchPage = (req, res) => {
    const key = new RegExp("^" + req.body.key, "i");
    User.find({ name: key, role: { $ne: "admin" } })
        .select("name profile_image subscribers")
        .limit(3)
        .exec((err, users) => {
            if (err) {
                return res.status(400).send("Could not get users");
            }
            Playlist.find({ published: true })
                .select("_id")
                .exec((err, playlists) => {
                    if (err) {
                        return res.status(400).send("Something went wrong");
                    }
                    const publishedIds = playlists.map((playlist, index) => playlist._id);
                    Playlist.find({title: key, published: true}).select("-updatedAt").populate("createdBy", "_id name profile_image").exec((err, playlists) => {
                        if(err) {
                            return res.status(400).send("Something went wrong");
                        }
                        Video.find({
                            title: key,
                            $or: [{ playlist: null }, { playlist: { $in: publishedIds } }],
                        })
                            .select("title image uploadedBy view video_length createdAt")
                            .populate("uploadedBy", "name profile_image")
                            .limit(10)
                            .exec((err, videos) => {
                                if (err) {
                                    return res.status(400).send("Could not get videos");
                                }
                                const copyUsers = JSON.parse(JSON.stringify(users));
                                const usersFormat = copyUsers.map((user, index) => {
                                    user.subscribers = user.subscribers.length;
                                    return user;
                                });
                                res.json({
                                    users: usersFormat,
                                    playlists,
                                    videos,
                                });
                            });
                    })
                });
        });
};

exports.getWatchLaterVideos = (req, res) => {
    const { _id } = req.user;
    const { limit, skip } = req.body;
    Action.findOne({ user: _id })
        .select("-_id watch_later")
        .populate({
            path: "watch_later",
            select: "_id title view image video_length uploadedBy",
            populate: { path: "uploadedBy", select: "_id name profile_image" },
        })
        .exec((err, videos) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            const newOrderVideos = [];
            for (let i = videos.watch_later.length - 1; i >= 0; i--) {
                newOrderVideos.push(videos.watch_later[i]);
            }
            const slicedArray = newOrderVideos.slice(skip, skip + limit);
            res.json({ videos: slicedArray });
        });
};

exports.getHistory = (req, res) => {
    const { _id } = req.user;
    const { limit, skip } = req.body;
    Action.findOne({ user: _id })
        .select("-_id history")
        .populate({
            path: "history",
            select: "_id title view image video_length uploadedBy",
            populate: { path: "uploadedBy", select: "_id name profile_image" },
        })
        .exec((err, videos) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            const newOrderVideos = [];
            for (let i = videos.history.length - 1; i >= 0; i--) {
                newOrderVideos.push(videos.history[i]);
            }
            const slicedArray = newOrderVideos.slice(skip, skip + limit);
            res.json({ videos: slicedArray });
        });
};
