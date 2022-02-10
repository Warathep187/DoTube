const User = require("../model/user");
const Action = require("../model/action");
const Notification = require("../model/notification");
const Video = require("../model/video");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

exports.channel = (req, res) => {
    const { _id } = req.user;
    User.findById(_id)
        .select("-_id name profile_image subscribers")
        .exec((err, user) => {
            if (!user) {
                return res.status(400).send("Could not found user.");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            res.json(user);
        });
};

exports.getInformationForEdit = (req, res) => {
    const { _id } = req.user;
    User.findById(_id)
        .select("email name profile_image seller account_name bank bank_number")
        .exec((err, user) => {
            if (!user) {
                return res.status(404).send("User not found");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            res.json(user);
        });
};

exports.updateInformation = (req, res) => {
    const { _id } = req.user;
    const { name, image, account_name, bank, bank_number } = req.body;
    if (name.trim() === "") {
        return res.status(400).send("Name is require");
    } else if (name.trim().length > 32) {
        return res.status(400).send("Name must be less than 32 characters");
    } else if (account_name || bank || bank_number) {
        if (account_name.trim() === "") {
            return res.status(400).send("Account name is required");
        } else if (bank.trim() === "") {
            return res.status(400).send("Bank name is required");
        } else if (bank_number.trim() === "") {
            return res.status(400).send("Bank number is required");
        } else if (!["Kasikorn", "Krung Thai", "Bangkok"].includes(bank)) {
            return res.status(400).send("Bank must be Kasikorn, Krung Thai or Bangkok")
        }
    }
    User.findById(_id)
        .select("_id profile_image")
        .exec((err, user) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (!user) {
                return res.status(401).send("User is not found");
            }
            if (image) {
                const base64image = new Buffer.from(
                    image.replace(/^data:image\/\w+;base64,/, ""),
                    "base64"
                );
                const type = image.split(";")[0].split("/")[1];
                const deleteParams = {
                    Bucket: "dotube-imagestorage",
                    Key:
                        user.profile_image.key === ""
                            ? "/profile-image/unknow.jpg"
                            : user.profile_image.key,
                };
                s3.deleteObject(deleteParams, (err, result) => {
                    if (err) {
                        console.log(err);
                        return res.status(400).send("Could not delete old profile image");
                    }
                    const params = {
                        Bucket: "dotube-imagestorage",
                        Key: `profile-image/${uuidv4()}.${type}`,
                        Body: base64image,
                        ACL: "public-read",
                        ContentEncoding: "base64",
                        ContentType: "image/" + type,
                    };
                    s3.upload(params, (err, data) => {
                        if (err) {
                            return res.status(400).send("Could not upload profile image");
                        }
                        const profile_image = {
                            key: data.Key,
                            url: data.Location,
                        };
                        User.findByIdAndUpdate(_id, { name, profile_image, account_name, bank, bank_number, seller: account_name ? true: false }, { new: true })
                            .select("-_id name profile_image")
                            .exec((err, user) => {
                                if (err) {
                                    console.log(err);
                                    return res.status(400).send("Something went wrong");
                                }
                                res.json({
                                    message: "Changed successfully",
                                    user,
                                });
                            });
                    });
                });
            } else {
                User.findByIdAndUpdate(_id, { name, account_name, bank, bank_number, seller: account_name ? true: false }, { new: true })
                    .select("name profile_image")
                    .exec((err, user) => {
                        if (err) {
                            return res.status(400).send("Something went wrong");
                        }
                        res.json({
                            message: "Changed successfully",
                            user,
                        });
                    });
            }
        });
};

exports.channelSubscribers = (req, res) => {
    const { _id } = req.user;
    User.findById(_id)
        .select("-_id subscribers")
        .populate("subscribers", "_id name profile_image")
        .exec((err, subscribers) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            res.json(subscribers);
        });
};

exports.getSubscriptions = (req, res) => {
    const { _id } = req.user;
    Action.findOne({ user: _id })
        .select("subscriptions")
        .populate("subscriptions", "_id name profile_image")
        .exec((err, users) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            res.json(users);
        });
};

exports.getRecommended = (req, res) => {
    const { _id } = req.user;
    User.find({ _id: { $ne: _id }, subscribers: { $ne: _id }, role: {$ne: "admin"} })
        .sort({ subscribers: -1 })
        .limit(5)
        .exec((err, users) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            res.json(users);
        });
};

exports.userChannel = (req, res) => {
    const { _id } = req.user;
    const { id } = req.params;
    if (_id === id) {
        return res.json({ yourself: true });
    }
    User.findById(id)
        .select("name profile_image subscribers")
        .exec((err, user) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (!user) {
                return res.status(404).send("Could not found user.");
            }
            Action.findOne({ user: _id })
                .select("alert")
                .exec((err, alert) => {
                    if (err) {
                        return res.status(400).send("Something went wrong");
                    }
                    const subs = user.subscribers.length;
                    if (user.subscribers.includes(_id)) {
                        user.subscribers = undefined;
                        res.json({
                            channel: user,
                            subs,
                            isSubscribed: true,
                            isAlert: alert.alert.includes(id) ? true : false,
                        });
                    } else {
                        user.subscribers = undefined;
                        res.json({
                            channel: user,
                            subs,
                            isSubscribed: false,
                            isAlert: alert.alert.includes(id) ? true : false,
                        });
                    }
                });
        });
};

exports.subscribe = (req, res) => {
    const { _id } = req.user;
    const { userId } = req.body;
    if (_id == userId) {
        return res.status(401).send("You can not subscribe yourself.");
    }
    User.findById(userId)
        .select("_id subscribers")
        .exec((err, user) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (!user) {
                return res.status(400).send("User not found");
            }
            if (user.subscribers.includes(_id)) {
                return res.status(403).send("You are already subscribed");
            }
            Action.updateOne({ user: _id }, { $push: { subscriptions: userId } }).exec(
                (err, result) => {
                    if (err) {
                        return res.status(400).send("Something went wrong");
                    }
                    User.updateOne({ _id: userId }, { $push: { subscribers: _id } }).exec(
                        (err, result) => {
                            if (err) {
                                return res.status(400).send("Could not subscribe user");
                            }
                            res.json({
                                ok: true,
                            });
                            const newAlert = new Notification({
                                from_user: _id,
                                to_user: userId,
                                type: "subscribe",
                            });
                            newAlert.save((err, alert) => {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    );
                }
            );
        });
};

exports.unsubscribe = (req, res) => {
    const { _id } = req.user;
    const { userId } = req.body;
    if (_id == userId) {
        return res.status(401).send("You can not unsubscribe yourself.");
    }
    User.findById(userId)
        .select("_id subscribers")
        .exec((err, user) => {
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            if (!user) {
                return res.status(400).send("User not found");
            }
            if (!user.subscribers.includes(_id)) {
                return res.status(400).send("You are not subscribe this  channel.");
            }
            User.updateOne({ _id: userId }, { $pull: { subscribers: _id } }).exec((err, result) => {
                if (err) {
                    return res.status(400).send("Something went wrong");
                }
                Action.updateOne({ user: _id }, { $pull: { subscriptions: userId } }).exec(
                    (err, result) => {
                        if (err) {
                            return res.status(400).send("Something went wrong");
                        }
                        res.json({
                            ok: true,
                        });
                        Notification.deleteOne({
                            from_user: _id,
                            to_user: userId,
                            type: "subscribe",
                        }).exec((err, deleted) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                );
            });
        });
};

exports.alert = (req, res) => {
    const { _id } = req.user;
    const { channelId } = req.body;
    if (_id == channelId) {
        return res.status(403).send("You can not get your notifications");
    }
    User.findById(channelId)
        .select("_id")
        .exec((err, channel) => {
            if (!channel) {
                return res.status(400).send("Channel not found");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            Action.findOne({ user: _id })
                .select("alert")
                .exec((err, alert) => {
                    if (err) {
                        return res.status(400).send("Something went wrong");
                    }
                    if (alert.alert.includes(channelId)) {
                        return res
                            .status(400)
                            .send("You already get all notification from this channel");
                    }
                    Action.updateOne({ user: _id }, { $push: { alert: channelId } }).exec(
                        (err, success) => {
                            if (err) {
                                return res
                                    .status(400)
                                    .send("Could not get this channel's notification");
                            }
                            res.status(201).json({ message: "You’ll get all notifications" });
                        }
                    );
                });
        });
};

exports.removeAlert = (req, res) => {
    const { _id } = req.user;
    const { channelId } = req.body;
    User.findById(channelId)
        .select("_id")
        .exec((err, channel) => {
            if (!channel) {
                return res.status(400).send("Channel not found");
            }
            if (err) {
                return res.status(400).send("Something went wrong");
            }
            Action.findOne({ user: _id })
                .select("alert")
                .exec((err, alert) => {
                    if (err) {
                        return res.status(400).send("Something went wrong");
                    }
                    if (!alert.alert.includes(channelId)) {
                        return res
                            .status(400)
                            .send("You never turn on notification from this channel");
                    }
                    Action.updateOne({ user: _id }, { $pull: { alert: channelId } }).exec(
                        (err, success) => {
                            if (err) {
                                return res
                                    .status(400)
                                    .send("Could not get this channel's notification");
                            }
                            res.status(201).json({
                                message: "Notifications turned off for this channel",
                            });
                        }
                    );
                });
        });
};
