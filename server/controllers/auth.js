const User = require("../model/user");
const Action = require("../model/action");
const jwt = require("jsonwebtoken");
const AWS = require("aws-sdk");
const { hashPassword, comparePassword } = require("../helper/auth");
const expressJwt = require("express-jwt");

const SES = new AWS.SES({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    apiVersion: process.env.AWS_API_VERSION,
});

exports.requireSignIn = expressJwt({
    getToken: (req, res) => req.cookies.token,
    secret: process.env.JWT_SECRET_KEY,
    algorithms: ["sha1", "RS256", "HS256"],
}); //return req.user

exports.register = (req, res) => {
    const { email, name, password } = req.body;
    User.findOne({ email })
        .select("_id")
        .exec((err, user) => {
            if (err) {
                return res.status(400).send("Something went wrong. Please try again.");
            }
            if (user) {
                return res.status(400).send("Email has already existed");
            }
            const token = jwt.sign(
                { email, name, password: password.trim() },
                process.env.JWT_VERIFY_SECRET_KEY,
                {
                    expiresIn: "10m",
                }
            );
            const params = {
                Source: process.env.DOTUBE_EMAIL,
                Destination: {
                    ToAddresses: [email],
                },
                Message: {
                    Body: {
                        Html: {
                            Charset: "UTF-8",
                            Data: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0"><div style="border-bottom:1px solid #eee"><h1 style="font-size:2em;text-decoration:none;font-weight:900;color:#0D6EFD;">DoTube</h1></div><p style="font-size:2em">Hi, ${name}.Use the following URL to complete your registration procedures. This URL is valid for 10 minutes.</p></br><a href="${
                                process.env.CLIENT_URL + "/verify-account/" + token
                            }">${
                                process.env.CLIENT_URL + "/verify-account/" + token
                            }</a><hr style="border:none;border-top:1px solid #eee" /><div style="float:right;padding:8px 0;font-size:0.8em;line-height:1;font-weight:300"><p>DoTube, Thailand</p></div></div></div>`,
                        },
                    },
                    Subject: {
                        Charset: "UTF-8",
                        Data: "Complete your registration.",
                    },
                },
            };
            const sendEmail = SES.sendEmail(params).promise();
            sendEmail
                .then((response) => {
                    res.json({
                        message: `Email has been sent to ${email}, please verify your email`,
                    });
                })
                .catch((e) => {
                    res.status(400).send(`Could not send email to ${email}`);
                });
        });
};

exports.verify = (req, res) => {
    try {
        const { token } = req.body;
        jwt.verify(token, process.env.JWT_VERIFY_SECRET_KEY, (err, decoded) => {
            if(err) {
                return res.status(400).send("Token has expired");
            }
            const { email, name, password } = decoded;
            User.findOne({ email })
                .select("_id")
                .exec(async(err, user) => {
                    if (err) {
                        return res.status(400).send("Something went wrong");
                    }
                    if (user) {
                        return res.status(400).send("User already exists");
                    }
                    const hashedPassword = await hashPassword(password);
                    const newUser = new User({ email, name, password: hashedPassword});
                    newUser.save((err, result) => {
                        if (err) {
                            console.log(err);
                            return res.status(400).send("Could not create user.");
                        }
                        const newAction = new Action({user: result._id, subscriptions: [], alert: [], purchased: [], history: [], watch_later: []});
                        newAction.save((err, action) => {
                            if (err) {
                                return res.status(400).send("Could not create user.");
                            }
                            res.json({ message: "Verified. Let's login" });
                        })
                    });
                });
        });
    } catch (e) {
        res.status(400).send("Token has expired.");
    }
};

exports.login = (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email })
        .select("_id password name profile_image role")
        .exec(async(err, user) => {
            if (err) {
                return res.status(400).send("Something went wrong, please try again");
            }
            if (!user) {
                return res.status(400).send("Email or password is invalid.");
            }
            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) {
                return res.status(400).send("Email or password is invalid.");
            }
            const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET_KEY, {
                expiresIn: "1d"
            })
            user.password = undefined;
            res.cookie("token", token, {
                httpOnly: true,
            })
            res.json(user);
        });
};

exports.forgotPassword = (req, res) => {
    const {email} = req.body;
    const random = Math.round(Math.random() * (999999 - 100000) + 100000)
    User.findOneAndUpdate({email}, {reset_password_otp: random+""}).select("_id").exec((err, user) => {
        if(err) {
            return res.status(400).send("Something went wrong");
        }
        if(!user) {
            return res.status(400).send(`Could not found ${email}.`)
        }
        const params = {
            Source: process.env.DOTUBE_EMAIL,
            Destination: {
                ToAddresses: [email],
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2"><div style="margin:50px auto;width:70%;padding:20px 0"><div style="border-bottom:1px solid #eee"><h1 style="font-size:2em;text-decoration:none;font-weight:900;color:#0D6EFD;">DoTube</h1></div><p style="font-size:2em">Use the following OTP to confirm the password resetting procedure. OTP expires in 3 minutes.</p></br><p style="margin: 10px; color: #eee; background-color: #0D6EFD; font-size: 2em; text-align: center;font-weight:600">${random}</p><hr style="border:none;border-top:1px solid #eee" /><div style="float:right;padding:8px 0;font-size:0.8em;line-height:1;font-weight:300"><p>DoTube, Thailand</p></div></div></div>`,
                    },
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: "Complete your password resetting.",
                },
            },
        };
        const sendEmail = SES.sendEmail(params).promise();
        sendEmail
            .then((response) => {
                res.json({
                    message: `OTP has been sent to ${email}`,
                });
                setTimeout(() => {
                    User.updateOne({email}, {reset_password_otp: ""}).exec((err, result) => {
                    })
                }, 180000)
            })
            .catch((e) => {
                console.log(e);
                res.status(400).send(`Could not send email to ${email}`);
            });
    })
}

exports.resetPassword = (req, res) => {
    const {email, otp, password} = req.body;
    User.findOne({email}).select("reset_password_otp").exec(async(err, user) => {
        if(err) {
            return res.status(400).send("Something went wrong");
        }
        if(!user) {
            return res.status(400).send(`Could not found ${email}.`)
        }
        if(otp !== user.reset_password_otp) {
            return res.status(400).send("Otp does not match");
        }
        const hashedPassword = await hashPassword(password);
        User.updateOne({email}, {password: hashedPassword, reset_password_otp: ""}).exec((err, updated) => {
            if(err) {
                return res.status(400).send("Something went wrong");
            }
            res.json({
                message: "Reset password successfully. Let's login"
            })
        })
    })
}

exports.getLoggedInUserData = (req, res) => {
    const {_id} = req.user;
    User.findById(_id).select("_id name profile_image role").exec((err, user) => {
        if(err) {
            return res.status(400).send("Something went wrong");
        }
        if(!user) {
            return res.status(401).send("You could not logged in");
        }
        res.json(user);
    })
}

exports.checkIsUser = (req, res) => {
    const {_id} = req.user;
    User.findById(_id).select("_id").exec((err, user) => {
        if(!user) {
            return res.status(401).send("You are not authorized to access this page");
        }
        if(err) {
            return res.status(400).send("Something went wrong");
        }
        res.json({ok: true});
    })
}

exports.checkUser = (req, res, next) => {
    const {_id} = req.user;
    User.findById(_id).select("_id").exec((err, user) => {
        if(!user) {
            return res.status(401).send("You are not authorized to access this page");
        }
        if(err) {
            return res.status(400).send("Something went wrong");
        }
        next();
    })
}

exports.logout = (req, res) => {
    res.clearCookie("token");
    res.json({ok: true});
}