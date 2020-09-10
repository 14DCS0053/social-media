const express = require("express");
const router = express.Router();
const user = require("../modal/user");
const token = require("../modal/token");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { secret } = require("../config");
const auth = require("../middleware/auth");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// aut user
router.get("/login", auth, async (req, res) => {
    try {
        const currentUser = await user.findById(req.currentUser.id).select("-password");
        res.json({ user: currentUser });
    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: "server error" });
    }
});


//LOGIN USER


router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!(email || password)) {
        return res.status(400).json({ msg: "email and password is required" });
    }
    try {
        const currentUser = await user.findOne({ email })
        if (!currentUser) {
            return res.status(401).json({ msg: "wrong username or password" });
        }
        bcrypt.compare(password, currentUser.password, async (err, match) => {
            if (!match) {
                return res.status(401).json({ msg: "wrong username or passwordddd" });
            }
            //console.log(currentUser);

            // check if user is verfied
            if (!currentUser.isVerified) {
                return res.status(400).json({ notVerifed: true, msg: "please verify your account" });
            }
            const payload = {
                user: {
                    id: currentUser.id
                }
            };
            const token = await jwt.sign(payload, secret);
            const userData = { name: currentUser.name, email: currentUser.email, avatar: currentUser.avatar, gender: currentUser.gender, _id: currentUser.id }
            res.json({ token, user: userData });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "server error" });
    }
});


//REGISTER USER


router.post("/register", async (req, res) => {
    const { name, email, password, gender } = req.body;
    if (!(name || email || password || gender)) {
        return res.status(400).json({ msg: "all fields are required" });
    }
    try {
        const exist = await user.findOne({ email });
        if (exist) {
            return res.status(400).json({ msg: "user already exist,try with diffrent email account" });
        }
        //create a new user
        const User = new user({
            name,
            email,
            password,
            gender
        });
        //hash password for security
        const salt = await bcrypt.genSalt(10);
        User.password = await bcrypt.hash(password, salt);

        await User.save();
        const payload = {
            user: {
                id: User.id
            }
        };
        // create and save a confirmation token
        const newToken = new token({ user: User.id, token: crypto.randomBytes(16).toString("hex") });
        await newToken.save();
        // send a confirmation mail to user
        const transporter = nodemailer.createTransport({
            service: "gmail",
            tls: {
                rejectUnauthorized: false
            },
            auth: {
                user: "khanyasir0749@gmail.com",
                pass: "pgutjakulbcswtpn"
            }
        });
        // create a html
        const emailHtml = `token = ${newToken.token}`;

        var mailOptions = {
            from: "khanyasir0749@gmail.com",
            to: email,
            subject: "Conformation Mail",
            html: emailHtml
        };
        // transporter.sendMail(mailOptions, function (err) {
        //     if (err) {
        //         return res.status(500).json({ msg: "server error" });
        //     }
        //     // send a token
        //     jwt.sign(payload, secret, (err, token) => {
        //         if (err) throw err;
        //         res.send({ msg: "successfully registered now go to mail and verify your registration", token });
        //     });
        // }); // Send email

        res.send({ msg: "successfully registered now go to mail and verify your registration", token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ server: "server ekjj jrror" });
    }
});
module.exports = router;