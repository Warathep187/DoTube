const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

exports.registerValidator = (req, res, next) => {
    const {email, name, password, confirm} = req.body;
    if(!validateEmail(email)) {
        res.status(400).send("Email is invalid");
    }else if(name.trim() === "") {
        res.status(400).send("Please enter your name");
    }else if(name.trim().length > 32) {
        res.status(400).send("Name must be less than 32 characters")
    }else if(password.trim().length < 6) {
        res.status(400).send("Password must be at least 6 characters");
    }else if(password.trim() !== confirm.trim()) {
        res.status(400).send("Password does not match");
    }else {
        next();
    }
}

exports.loginValidator = (req, res, next) => {
    const {email, password} = req.body;
    if(!validateEmail(email)) {
        res.status(400).send("Email is invalid");
    }else if(password.trim().length < 6) {
        res.status(400).send("Password must be at least 6 characters");
    }else {
        next();
    }
}

exports.forgotPasswordValidator = (req, res, next) => {
    const {email} = req.body;
    if(!validateEmail(email)) {
        res.status(400).send("Email is not valid");
    }else {
        next();
    }
}

exports.resetPasswordValidator = (req, res, next) => {
    const {email, otp, password, confirm} = req.body;
    if(!validateEmail(email)) {
        res.status(400).send("Email is invalid");
    }else if(password.trim().length < 6) {
        res.status(400).send("Password must be at least 6 characters");
    }else if(password.trim() !== confirm.trim()) {
        res.status(400).send("Password does not match");
    }else if(otp.trim().length !== 6) {
        res.status(400).send("OTP format is invalid");
    }else {
        next();
    }
}