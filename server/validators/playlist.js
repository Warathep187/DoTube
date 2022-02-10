exports.createValidator = (req, res, next) => {
    const {title, description, image, paid, price} = req.body;
    if(title.trim().length === 0) {
        res.status(400).send("title is required");
    }else if(description.trim().length === 0) {
        res.status(400).send("description is required");
    }else if(description.trim().length > 512) {
        res.status(400).send("description must be less than 512 characters");
    }else if(image === "") {
        res.status(400).send("image is required");
    }else if(paid && ![59, 99, 159, 199, 259, 299].includes(price)) {
        res.status(400).send("price must be only 0, 59, 99, 159, 199, 259 and 299")
    }else if(!paid && price !== 0) {
        res.status(400).send("price must be 0")
    }else {
        next();
    }
}

exports.updatePlaylistValidator = (req, res, next) => {
    const {title, description, paid, price} = req.body;
    if(title.trim().length === 0) {
        res.status(400).send("title is required");
    }else if(description.trim().length === 0) {
        res.status(400).send("description is required");
    }else if(description.trim().length > 512) {
        res.status(400).send("description must be less than 512 characters");
    }else if(paid && ![59, 99, 159, 199, 259, 299].includes(price)) {
        res.status(400).send("price must be only 0, 59, 99, 159, 199, 259 and 299")
    }else if(!paid && price !== 0) {
        res.status(400).send("price must be 0")
    }else {
        next();
    }
}