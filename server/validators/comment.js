exports.commentValidator = (req, res, next) => {
    const {content} = req.body;
    if(content.trim() === "") {
        res.status(400).send("Content is required");
    }else if(content.trim().length > 512) {
        res.status(400).send("Content must be 512 characters long");
    }else {
        next();
    }
}