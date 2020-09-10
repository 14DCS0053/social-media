const express = require("express");
const router = express.Router();
const user = require("../modal/user");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

router.post("/", async(req, res) => {
    // check user send email 
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ msg: "Please Enter Your Email Address" });
    }
    // check if user exist
    try {
        const currentUser = await user.findOne({ email });
        if (!currentUser) {
            return res.status(400).json({ msg: "We have No Account for this email" });
        }
        // set a PasswordRestToken for this user
        currentUser.resetPassworedToken = crypto.randomBytes(16).toString("hex");
        // set time limet to reset for 1 hour
        currentUser.resetPassworedExpires = Date.now() + 3600000;

        // send the token on user email
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
            to: currentUser.email,
            subject: "Password Updated",
            text: `token = ${currentUser.resetPassworedToken}`
        };
        transporter.sendMail(mailOptions, function(err) {
            if (err) {
                return res.status(500).json({ msg: "server error" });
            }
        });
        res.json({ msg: "A token is send to your email " });
    } catch (error) {
        res.status(500).json({ msg: "server error" });
    }
});
module.exports = router;