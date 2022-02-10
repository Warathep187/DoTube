const User = require("../model/user");
const Payment = require("../model/payment");
const Comment = require("../model/comment");
const Video = require("../model/video");
const Playlist = require("../model/playlist");
const Notification = require("../model/notification");
const Action = require("../model/action");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

exports.checkAdmin = (req, res, next) => {
    const { _id } = req.user;
    User.findById(_id)
        .select("-_id role")
        .exec((err, user) => {
            if (!user) {
                return res.status(404).send("User not found");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (user.role != "admin") {
                return res.status(403).send("You can not access this page");
            }
            next();
        });
};

exports.checkIsAdmin = (req, res) => {
    const { _id } = req.user;
    User.findById(_id)
        .select("-_id role")
        .exec((err, user) => {
            if (!user) {
                return res.status(404).send("User not found");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (user.role != "admin") {
                return res.status(403).send("You can not access this page");
            }
            res.json({ ok: true });
        });
};

exports.getAllUsers = (req, res) => {
    const { limit, skip } = req.body;
    User.find({ role: { $ne: "admin" } })
        .select("_id name profile_image createdAt subscribers")
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .exec((err, users) => {
            if (err) {
                return res.status(400).send("Could not get users");
            }
            const copy = JSON.parse(JSON.stringify(users));
            const subscribersHidden = copy.map((user, index) => {
                user.subscribers = user.subscribers.length;
                return user;
            });
            res.json({
                users: subscribersHidden,
            });
        });
};

exports.userChannel = (req, res) => {
    const { id } = req.params;
    User.findById(id)
        .select("-password -reset_password_otp -createdAt -updatedAt")
        .exec((err, user) => {
            if (!user) {
                return res.status(404).send("User not found");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            const copy = JSON.parse(JSON.stringify(user));
            copy.subscribers = copy.subscribers.length;
            res.json({
                user: copy,
            });
        });
};

exports.channelVideos = (req, res) => {
    const { id } = req.params;
    Video.find({ uploadedBy: id })
        .select("title image createdAt video_length")
        .sort({ createdAt: -1 })
        .exec((err, videos) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            res.json(videos);
        });
};

exports.channelPlaylists = (req, res) => {
    const { id } = req.params;
    Playlist.find({ createdBy: id })
        .select("title image paid price createdAt")
        .sort({ createdAt: -1 })
        .exec((err, playlists) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            res.json(playlists);
        });
};

exports.deleteChannel = (req, res) => {
    const { id } = req.params;
    User.findById(id)
        .select("_id profile_image")
        .exec((err, user) => {
            if (!user) {
                return res.status(404).send("User not found");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            User.deleteOne({ _id: id }).exec((err, deleted) => {
                if (err) {
                    return res.status(400).send("Could not delete this channel");
                }
                res.json({ message: "Channel deleted successfully" });
                const deleteProfileParams = {
                    Bucket: "dotube-imagestorage",
                    Key: user.profile_image.key,
                };
                s3.deleteObject(deleteProfileParams, (err, deleted) => {
                    if(err) {
                        console.log(err);
                    }
                    Action.deleteOne({user: id}).exec((err, deleted) => {
                        if(err) {
                            console.log(err);
                        }
                        Action.updateMany({subscriptions: id}, {$pull: {subscriptions: id}}).exec((err, updated) => {
                            if(err) {
                                console.log(err);
                            }
                            Action.updateMany({alert: id}, {$pull: {alert: id}}).exec((err, updated) => {
                                if(err) {
                                    console.log(err);
                                }
                                Notification.deleteMany({$or: [{from_user: id}, {to_user: id}]}).exec((err, deleted) => {
                                    if(err) {
                                        console.log(err);
                                    }
                                    Playlist.find({createdBy: id}).select("_id image").exec((err, playlists) => {
                                        if(err) {
                                            console.log(err);
                                        }
                                        for(playlist of playlists) {
                                            const deletePlaylistParams = {
                                                Bucket: "dotube-imagestorage",
                                                Key: playlist.image.key,
                                            };
                                            s3.deleteObject(deletePlaylistParams, (err, deleted) => {
                                                if(err) {
                                                    console.log(err);
                                                }
                                            })
                                        }
                                        const arrayOfPlaylistIds = playlists.map((playlist, index) => playlist._id)
                                        Playlist.deleteMany({createdBy: id}).exec((err, deleted) => {
                                            if(err) {
                                                console.log(err);
                                            }
                                            for(playlistId of arrayOfPlaylistIds) {
                                                Action.updateOne({purchased: playlistId}, {$pull: {purchased: playlistId}}).exec((err, pulled) => {
                                                    if(err) {
                                                        console.log(err);
                                                    }
                                                })
                                            }
                                            Video.find({uploadedBy: id}).select("_id image video").exec((err, videos) => {
                                                if(err) {
                                                    console.log(err);
                                                }
                                                Video.deleteMany({uploadedBy: id}).exec((err, deleted) => {
                                                    if(err) {
                                                        console.log(err);
                                                    }
                                                    const arrayOfVideoIds = videos.map((video, index) => video._id);
                                                    const arrayOfVideoImages = videos.map((video, index) => video.image.key);
                                                    const arrayOfVideos = videos.map((video, index) => video.video.key);
                                                    for(videoId of arrayOfVideoIds) {
                                                        Action.updateOne({history: videoId}, {$pull: {history: videoId}}).exec((err, pulled) => {
                                                            if(err) {
                                                                console.log(err);
                                                            }
                                                            Action.updateOne({watch_later: videoId}, {$pull: { watch_later: videoId }}).exec((err, pulled) => {
                                                                if(err) {
                                                                    console.log(err);
                                                                }
                                                            })
                                                        })
                                                    }
                                                    for(key of arrayOfVideoImages) {
                                                        const deleteVideoImageParams = {
                                                            Bucket: "dotube-imagestorage",
                                                            Key: key,
                                                        };
                                                        s3.deleteObject(deleteVideoImageParams, (err, deleted) => {
                                                            if(err) {
                                                                console.log(err);
                                                            }
                                                        })
                                                    }
                                                    for(key of arrayOfVideos) {
                                                        const deleteVideoParams = {
                                                            Bucket: "dotube-imagestorage",
                                                            Key: key,
                                                        };
                                                        s3.deleteObject(deleteVideoParams, (err, deleted) => {
                                                            if(err) {
                                                                console.log(err);
                                                            }
                                                        })
                                                    }
                                                    Payment.find({buyer: id}).select("slip_image").exec((err, payments) => {
                                                        if(err) {
                                                            console.log(err);
                                                        }
                                                        for(payment of payments) {
                                                            const deleteSlipParams = {
                                                                Bucket: "dotube-imagestorage",
                                                                Key: payment.slip_image.key,
                                                            };
                                                            s3.deleteObject(deleteSlipParams, (err, deleted) => {
                                                                if(err) {
                                                                    console.log(err);
                                                                }
                                                            })
                                                        }
                                                        Payment.deleteMany({buyer: id}).exec((err, deleted) => {
                                                            if(err) {
                                                                console.log(err);
                                                            }
                                                            Comment.deleteMany({commentedBy: id}).exec((err, deleted) => {
                                                                if(err) {
                                                                    console.log(err);
                                                                }
                                                                User.updateMany({subscribers: id}, {$pull: {subscribers: id}}).exec((err, deleted) => {
                                                                    if(err) {
                                                                        console.log(err);
                                                                    }
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
                //delete profile_image from s3 x
                //delete Action x
                //delete subscription in Action model x
                //delete alert in Action model x
                //delete notification x
                //delete playlists x
                //delete playlist from purchased in Action x
                //delete playlist image x
                //delete videos x
                //delete history in action model x
                //delete watch_later in action model x
                //delete video image x
                //delete payment x
                //delete slip image x
                //delete comments x
                //delete from channel subscribed x
            });
        });
};

exports.singleVideo = (req, res) => {
    const { v } = req.params;
    Video.findById(v)
        .populate("uploadedBy", "_id profile_image name")
        .populate("playlist", "_id title description")
        .exec((err, video) => {
            if (!video) {
                return res.status(404).send("Video not found");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            res.json({
                title: video.title,
                description: video.description,
                videoLink: video.video.url,
                uploadedBy: video.uploadedBy,
                like: video.like.length,
                view: video.view,
                playlist: video.playlist,
                createdAt: video.createdAt,
            });
        });
};

exports.deleteVideo = (req, res) => {
    const { id } = req.params;
    Video.findOneAndDelete({ _id: id })
        .select("image video")
        .exec((err, video) => {
            if (err) {
                return res.status(400).send("Could not delete this video");
            }
            res.json({ message: "Video deleted successfully" });
            Notification.deleteMany({ video_id: id }).exec((err, deleted) => {
                if (err) {
                    console.log(err);
                }
                Comment.deleteMany({ video: id }).exec((err, deleted) => {
                    if (err) {
                        console.log(err);
                    }
                    Action.updateOne({ watch_later: id }, { $pull: { watch_later: id } }).exec(
                        (err, action) => {
                            if (err) {
                                console.log(err);
                            }
                            Action.updateOne({ history: id }, { $pull: { history: id } }).exec(
                                (err, action) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    const imageParams = {
                                        Bucket: "dotube-imagestorage",
                                        Key: video.image.key,
                                    };
                                    s3.deleteObject(imageParams, (err, deleted) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        const videoParams = {
                                            Bucket: "dotube-imagestorage",
                                            Key: video.video.key,
                                        };
                                        s3.deleteObject(videoParams, (err, deleted) => {
                                            if (err) {
                                                console.log(err);
                                            }
                                        });
                                    });
                                }
                            );
                        }
                    );
                });
            });
        });
};

exports.comments = (req, res) => {
    const { id } = req.params;
    const { limit, skip } = req.body;
    Comment.find({ video: id })
        .select("-updatedBy")
        .populate("commentedBy", "_id name profile_image")
        .limit(limit)
        .skip(skip)
        .sort({ like: -1 })
        .exec((err, comments) => {
            if (err) {
                return res.status(400).send("Could not get comments");
            }
            const copy = JSON.parse(JSON.stringify(comments));
            const newFormatComment = copy.map((comment, index) => {
                comment.like = comment.like.length;
                return comment;
            });
            res.json(newFormatComment);
        });
};

exports.deleteComment = (req, res) => {
    const { id } = req.params;
    Comment.findById(id)
        .select("_id")
        .exec((err, comment) => {
            if (!comment) {
                return res.status(404).send("Comment not found");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            Comment.deleteOne({ _id: id }).exec((err, deleted) => {
                if (err) {
                    return res.status(400).send("Could not delete comment");
                }
                res.json({
                    message: "Comment deleted",
                });
                Notification.deleteMany({
                    $or: [
                        { type: "comment", comment_id: id },
                        { comment_id: id, type: "like_comment" },
                    ],
                }).exec((err, deleted) => {
                    if (err) {
                        console.log(err);
                    }
                });
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
                return res.status(400).send("Something went wrong");
            }
            Playlist.find({title: key}).select("-_id title").limit(3).exec((err, playlists) => {
                if(err) {
                    return res.status(400).send("Something went wrong");
                }
                Video.find({ title: key })
                .select("-_id title")
                .limit(5)
                .exec((err, videos) => {
                    if (err) {
                        return res.status(400).send("Something went wrong");
                    }
                    res.json([...users, ...playlists, ...videos]);
                });
            })
        });
};

exports.searchPage = (req, res) => {
    const key = new RegExp("^" + req.body.key, "i");
    User.find({ name: key, role: { $ne: "admin" } })
        .select("name profile_image subscribers")
        .limit(5)
        .exec((err, users) => {
            if (err) {
                return res.status(400).send("Could not get users");
            }
            Playlist.find({ title: key })
                .select("title image paid price bought createdBy createdAt")
                .populate("createdBy", "_id name profile_image")
                .limit(5)
                .exec((err, playlists) => {
                    if (err) {
                        return res.status(400).send("Could not get playlists");
                    }
                    Video.find({
                        title: key,
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
                                videos,
                                playlists,
                            });
                        });
                });
        });
};

exports.getPlaylistInfo = (req, res) => {
    const { id } = req.params;
    Playlist.findById(id)
        .populate("createdBy", "name profile_image")
        .exec((err, playlist) => {
            if (!playlist) {
                return res.status(404).send("Playlist not found");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            res.json(playlist);
        });
};

exports.getPlaylistVideos = (req, res) => {
    const { id } = req.params;
    Video.find({ playlist: id })
        .select("-like -updatedAt -description")
        .sort({ createdAt: -1 })
        .exec((err, videos) => {
            if (err) {
                return res.status(400).send("Could not get videos");
            }
            res.json(videos);
        });
};

exports.deletePlaylist = (req, res) => {
    const { id } = req.params;
    Playlist.findById(id)
        .select("_id image paid")
        .exec((err, playlist) => {
            if (!playlist) {
                return res.status(404).send("Playlist not found");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            Playlist.deleteOne({ _id: id }).exec((err, deleted) => {
                if (err) {
                    return res.status(400).send("Could not delete playlist");
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
                            res.json({ message: "Playlist deleted successfully" });
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
                                            for (videoId of videosIdArray) {
                                                console.log(videoId);
                                                Action.updateMany(
                                                    { watch_later: videoId },
                                                    { $pull: { watch_later: videoId } }
                                                ).exec((err, updated) => {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                    Action.updateMany(
                                                        { history: videoId },
                                                        { $pull: { history: videoId } }
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

exports.payments = (req, res) => {
    Payment.find({})
        .populate("playlist", "_id title image")
        .sort({ createdAt: -1 })
        .exec((err, payments) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            res.json(payments);
        });
};

exports.cancelPayment = (req, res) => {
    const { id, reason } = req.body;
    if (reason === "") {
        res.status(400).send("Reason is required");
    } else if (!["Incorrect amount", "Invalid slip"].includes(reason)) {
        res.status(400).send("Reason is invalid");
    } else {
        Payment.findById(id)
            .select("confirm cancel")
            .exec((err, payment) => {
                if (!payment) {
                    return res.status(404).send("Payment not found");
                }
                if (err) {
                    return res.status(400).send("Something went wrong");
                }
                if (payment.confirm) {
                    return res.status(400).send("Payment is already confirmed");
                }
                if (payment.cancel) {
                    return res.status(400).send("Payment is already cancelled");
                }
                Payment.updateOne({ _id: id }, { cancel: true, reason }).exec((err, updated) => {
                    if (err) {
                        return res.status(400).send("Could not cancel the payment");
                    }
                    res.json({ message: "Canceled" });
                });
            });
    }
};

exports.confirmPayment = (req, res) => {
    const { id } = req.body;
    Payment.findById(id)
        .select("playlist confirm cancel buyer")
        .exec((err, payment) => {
            if (!payment) {
                return res.status(404).send("Payment not found");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (payment.confirm) {
                return res.status(400).send("Payment is already confirmed");
            }
            if (payment.cancel) {
                return res.status(400).send("Payment is already cancelled");
            }
            Action.findOne({ user: payment.buyer })
                .select("purchased")
                .exec((err, action) => {
                    if (err) {
                        return res.status(400).send("Something went wrong");
                    }
                    if (action.purchased.includes(payment.playlist)) {
                        return res.status(400).send("User has already bought this playlist");
                    }
                    Payment.updateOne({ _id: id }, { confirm: true }).exec((err, updated) => {
                        if (err) {
                            return res.status(400).send("Could not confirm the payment");
                        }
                        Action.updateOne(
                            { user: payment.buyer },
                            { $push: { purchased: payment.playlist } }
                        ).exec((err, pushed) => {
                            if (err) {
                                return res.status(400).send("Something went wrong");
                            }
                            res.json({ message: "Confirmed" });
                            Playlist.updateOne(
                                { _id: payment.playlist },
                                { $inc: { bought: 1 } }
                            ).exec((err, added) => {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        });
                    });
                });
        });
};
