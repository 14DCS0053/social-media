const express = require("express");
const router = express.Router();
const user = require("../modal/user");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

// get the token to verify reset password
router.get("/:token", async(req, res) => {
    // check if token exist
    try {
        const currentUser = await user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
        if (!currentUser) {
            return res.status(400).json({ msg: "reset password link has been expired" });
        }
        res.json({ msg: "ok" });

    } catch (error) {
        res.status(500).json({ msg: "server error" });
    }
});

// verify and change password
router.post("/:token", async(req, res) => {
    // check if token exist
    try {
        const currentUser = await user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
        if (!currentUser) {
            return res.status(400).json({ msg: "reset password link has been expired" });
        }
        // check if user has send new password
        const { newPassword } = req.body;
        if (!newPassword) {
            return res.status(400).json({ msg: "please enter your new password" });
        }
        // hash new password and save it
        const salt = await bcrypt.genSalt(10);
        currentUser.password = await bcrypt.hash(newPassword, salt);
        // remove the reset token feild from current user
        currentUser.resetPasswordExpires = undefined;
        currentUser.resetPasswordToken = undefined;
        // save the current user
        await currentUser.save();
        // send mail to client that password has been changed
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
            text: "Hi, Your password is changed now"
        };
        transporter.sendMail(mailOptions, function(err) {
            if (err) {
                return res.status(500).json({ msg: "server error" });
            }
        });
        res.json({ msg: "Your password is updated now" });
    } catch (error) {
        res.status(500).json({ msg: "server error" });
        console.log(error);
    }
});
module.exports = router;