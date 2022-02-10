exports.uploadVideoValidator = (req, res, next) => {
    const { title, description, image } = req.body;
    if (title.trim() === "") {
        res.status(400).send("title is require");
    } else if (description.length === 0) {
        res.status(400).send("Description is require");
    } else if (description.length > 512) {
        res.status(400).send("Description must be less than 512 characters");
    } else if (!image) {
        res.status(400).send("Image is require");
    } else {
        next();
    }
};

exports.updateVideoValidator = (req, res, next) => {
    const { title, description } = req.body;
    if (title.trim() === "") {
        res.status(400).send("title is require");
    } else if (description.trim().length === 0) {
        res.status(400).send("Description is require");
    } else if (description.trim().length > 512) {
        res.status(400).send("Description must be less than 512 characters");
    } else {
        next();
    }
}