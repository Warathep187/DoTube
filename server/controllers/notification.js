const Notification = require("../model/notification");

exports.getNotification = (req, res) => {
    const { _id } = req.user;
    const { limit, skip } = req.body;
    Notification.find({ to_user: _id })
        .select("-to_user -updatedAt")
        .populate("from_user", "name profile_image")
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .exec((err, notifications) => {
            if (err) {
                return res.status(400).send("Could not get notifications");
            }
            res.json(notifications);
        });
};
