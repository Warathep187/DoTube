const Video = require("../model/video");
const Comment = require("../model/comment");
const Playlist = require("../model/playlist");
const Action = require("../model/action");
const Notification = require("../model/notification");

exports.canViewComments = (req, res, next) => {
    const { _id } = req.user;
    const { v } = req.body;
    Video.findById(v)
        .select("uploadedBy playlist")
        .populate("playlist", "published paid")
        .exec((err, video) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (!video) {
                return res.status(404).send("Video not found");
            }
            if (video.uploadedBy == _id) {
                next();
            } else {
                if (!video.playlist) {
                    next();
                } else {
                    if (!video.playlist.published) {
                        res.status(403).send("You could not get any comments");
                    } else {
                        if (video.playlist.paid) {
                            Action.findOne({ user: _id })
                                .select("purchased")
                                .exec((err, action) => {
                                    if (err) {
                                        return res.status(400).send("Something went wrong");
                                    }
                                    if (action.purchased.includes(video.playlist._id)) {
                                        next();
                                    } else {
                                        return res.status(403).send("Could not see any comments");
                                    }
                                });
                        } else {
                            next();
                        }
                    }
                }
            }
        });
};

exports.comment = (req, res) => {
    const { _id } = req.user;
    const { videoId, content } = req.body;
    Video.findById(videoId)
        .select("uploadedBy playlist")
        .populate("playlist", "published paid")
        .exec((err, video) => {
            if (!video) {
                return res.status(404).send("Could not found video");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (video.uploadedBy == _id) {
                const newComment = new Comment({
                    content,
                    video: videoId,
                    commentedBy: _id,
                    like: [],
                });
                newComment.save((err, commented) => {
                    if (err) {
                        return res.status(400).send("Could not comment");
                    }
                    Comment.findById(commented._id)
                        .select("-video")
                        .populate("commentedBy", "name profile_image")
                        .exec((err, newComment) => {
                            if (err) {
                                return res.status(400).send("Could not get new comment");
                            }
                            const copyComment = JSON.parse(JSON.stringify(newComment));
                            copyComment.isLike = false;
                            copyComment.likes = 0;
                            copyComment.like = null;
                            res.json({ message: "Commented", comment: copyComment });
                        });
                });
            } else if (!video.playlist) {
                const newComment = new Comment({
                    content,
                    video: videoId,
                    commentedBy: _id,
                    like: [],
                });
                newComment.save((err, commented) => {
                    if (err) {
                        return res.status(400).send("Could not comment");
                    }
                    Comment.findById(commented._id)
                        .select("-video")
                        .populate("commentedBy", "name profile_image")
                        .exec((err, newComment) => {
                            if (err) {
                                return res.status(400).send("Could not get new comment");
                            }
                            const copyComment = JSON.parse(JSON.stringify(newComment));
                            copyComment.isLike = false;
                            copyComment.likes = 0;
                            copyComment.like = null;
                            res.json({ message: "Commented", comment: copyComment });
                            const newAlert = new Notification({
                                to_user: video.uploadedBy,
                                from_user: _id,
                                type: "comment",
                                video_id: videoId,
                                comment_id: commented._id,
                            });
                            newAlert.save((err, alert) => {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        });
                });
            } else {
                if (video.playlist.published) {
                    if (video.playlist.paid) {
                        Action.findOne({ user: _id })
                            .select("purchased")
                            .exec((err, purchased) => {
                                if (err) {
                                    return res.status(400).send("Something went wrong");
                                }
                                if (purchased.purchased.includes(video.playlist._id)) {
                                    const newComment = new Comment({
                                        content,
                                        video: videoId,
                                        commentedBy: _id,
                                        like: [],
                                    });
                                    newComment.save((err, commented) => {
                                        if (err) {
                                            return res.status(400).send("Could not comment");
                                        }
                                        Comment.findById(commented._id)
                                            .select("-video")
                                            .populate("commentedBy", "name profile_image")
                                            .exec((err, newComment) => {
                                                if (err) {
                                                    return res
                                                        .status(400)
                                                        .send("Could not get new comment");
                                                }
                                                const copyComment = JSON.parse(
                                                    JSON.stringify(newComment)
                                                );
                                                copyComment.isLike = false;
                                                copyComment.likes = 0;
                                                copyComment.like = null;
                                                res.json({
                                                    message: "Commented",
                                                    comment: copyComment,
                                                });
                                                const newAlert = new Notification({
                                                    to_user: video.uploadedBy,
                                                    from_user: _id,
                                                    type: "comment",
                                                    video_id: videoId,
                                                    comment_id: commented._id,
                                                });
                                                newAlert.save((err, alert) => {
                                                    if (err) {
                                                        console.log(err);
                                                    }
                                                });
                                            });
                                    });
                                } else {
                                    return res.status(403).send("You can not comment this post");
                                }
                            });
                    } else {
                        const newComment = new Comment({
                            content,
                            video: videoId,
                            commentedBy: _id,
                            like: [],
                        });
                        newComment.save((err, commented) => {
                            if (err) {
                                return res.status(400).send("Could not comment this video");
                            }
                            Comment.findById(commented._id)
                                .select("-video")
                                .populate("commentedBy", "name profile_image")
                                .exec((err, newComment) => {
                                    if (err) {
                                        return res.status(400).send("Could not get new comment");
                                    }
                                    const copyComment = JSON.parse(JSON.stringify(newComment));
                                    copyComment.isLike = false;
                                    copyComment.likes = 0;
                                    copyComment.like = null;
                                    res.json({ message: "Commented", comment: copyComment });
                                    const newAlert = new Notification({
                                        to_user: video.uploadedBy,
                                        from_user: _id,
                                        type: "comment",
                                        video_id: videoId,
                                        comment_id: commented._id,
                                    });
                                    newAlert.save((err, alert) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                    });
                                });
                        });
                    }
                } else {
                    res.status(403).send("Video is not publish");
                }
            }
        });
};

exports.getComments = (req, res) => {
    const { _id } = req.user;
    const { v, limit, skip } = req.body;
    Comment.find({ video: v })
        .select("-video")
        .populate("commentedBy", "name profile_image")
        .limit(limit)
        .skip(skip)
        .sort({ like: -1, createdAt: -1 })
        .exec((err, comments) => {
            if (err) {
                return res.status(err).send("Could not get comments");
            }
            const copyComments = JSON.parse(JSON.stringify(comments));
            const formatIsLike = copyComments.map((comment, index) => {
                if (comment.like.includes(_id)) {
                    comment.isLike = true;
                    comment.likes = comment.like.length;
                    comment.like = null;
                    return comment;
                } else {
                    comment.isLike = false;
                    comment.likes = comment.like.length;
                    comment.like = null;
                    return comment;
                }
            });
            res.status(200).json(formatIsLike);
        });
};

exports.like = (req, res) => {
    const { _id } = req.user;
    const { commentId } = req.body;
    Comment.findById(commentId)
        .select("commentedBy like video")
        .exec((err, comment) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (!comment) {
                return res.status(400).send("Could not found comment");
            }
            if (comment.like.includes(_id)) {
                return res.status(400).send("You already like this comment");
            }
            Comment.updateOne({ _id: commentId }, { $push: { like: _id } }).exec((err, liked) => {
                if (err) {
                    return res.status(400).send("Could not like this comment.");
                }
                res.json({ ok: true });
                if (_id != comment.commentedBy) {
                    const newAlert = new Notification({
                        to_user: comment.commentedBy,
                        from_user: _id,
                        type: "like_comment",
                        video_id: comment.video,
                        comment_id: commentId,
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
    const { commentId } = req.body;
    Comment.findById(commentId)
        .select("commentedBy like video_id")
        .exec((err, comment) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (!comment) {
                return res.status(400).send("Could not found comment");
            }
            if (!comment.like.includes(_id)) {
                return res.status(400).send("You never like this comment");
            }
            Comment.updateOne({ _id: commentId }, { $pull: { like: _id } }).exec((err, liked) => {
                if (err) {
                    return res.status(400).send("Could not unlike this comment.");
                }
                res.json({ ok: true });
                if (_id != comment.commentedBy) {
                    Notification.deleteOne({
                        from_user: _id,
                        to_user: comment.commentedBy,
                        type: "like_comment",
                        comment_id: commentId,
                    }).exec((err, deleted) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            });
        });
};

exports.deleteComment = (req, res) => {
    const { _id } = req.user;
    const { id } = req.params;
    Comment.findById(id)
        .select("commentedBy")
        .exec((err, comment) => {
            if (!comment) {
                return res.status(400).send("Comment not found");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (comment.commentedBy != _id) {
                return res.status(403).send("You ca not delete the comment");
            }
            Comment.deleteOne({ _id: id }).exec((err, deleted) => {
                if (err) {
                    return res.status(400).send("Could not delete the comment");
                }
                res.json({ message: "Comment deleted" });
                Notification.deleteOne({comment_id: id}).exec((err, success) => {
                    if(err) {
                        console.log(err);
                    }
                })
            });
        });
};
