const express = require("express");
const router = express.Router();
const Token = require("../modal/token");
const User = require("../modal/user");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
router.post("/", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ msg: "email is required" });
        }
        // check if a user exist with this email
        const existUser = await User.findOne({ email });
        if (!existUser) {
            return res.status(401).json({ msg: "No user exist with this mail id" });
        }
        // check if user is alreay verified 
        if (existUser.isVerified) {
            return res.status(400).json({ msg: "You are already verified Please Login Now" });
        }
        // create and save a new token
        const newToken = new Token({ user: existUser.id, token: crypto.randomBytes(16).toString("hex") });
        await newToken.save();

        // create a mail html
        const emailHtml = `<a href='http://${req.headers.host}/verifyEmail/${newToken.token}'>Click to confirm</a>`;

        // send mail to the user
        const transporter = nodemailer.createTransport({
            service: "gmail",
            tls: {
                rejectUnauthorized: false
            },
            auth: {
                user: "khanyasir0749@gmail.com",
                pass: "ganilzifmmefdplw"
            }
        });

        const mailOptions = {
            from: "khanyasir0749@gmail.com",
            to: email,
            subject: "Conformation Mail",
            html: emailHtml
        };
        transporter.sendMail(mailOptions, function (err) {
            if (err) {
                return res.status(500).json({ msg: "server error" });
            }
        });
        res.json({ msg: "conformation mail is send on your mail id " });
    } catch (error) {
        res.status(500).json({ msg: "server error" })
    }
});
module.exports = router;