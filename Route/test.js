const user = require("../modal/user");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const nodemailer = require("nodemailer");
const test = require("../modal/test");
// testing purpouse router
router.get("/", (req, res) => {
    user.find({}, (err, users) => {
        if (err) {
            return res.status(500).json({ msg: "srver error" });
        }
        return res.json({ users });
    });
});
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const newUer = new test({
            email,
            password
        });
        await newUer.save();
        res.json({ msg: "succesfully submitted" })
    } catch (error) {
        res.status(500).json({ msg: "server error" })
    }

});
router.get("/:id", async (req, res) => {
    try {
        const user = await user.find({ _id: req.params.id });
        if (!user) return res.status(404).json({ msg: "no user found" });
        res.json(user);
    } catch (error) {
        console.log(error);
        if (error.kind === "ObjectId") {
            return res.status(404).json({ msg: "no user found obj errr" });
        }
        res.status(500).json({ msg: "server error" });
    }
});
router.post("/sendMail", (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ msg: "email is required" });
    }
    var transporter = nodemailer.createTransport({
        service: "gmail",
        tls: { rejectUnauthorized: false },
        auth: { user: "khanyasir0749@gmail.com", pass: "ganilzifmmefdplw" }
    });
    var mailOptions = {
        from: "khanyasir0749@gmail.com",
        to: email,
        subject: "ignore this mail",
        html: `<a href='http://${req.headers.host}/confirm'>confirm</a>`
    };
    transporter.sendMail(mailOptions, function (err) {
        if (err) {
            return res.status(500).json({ msg: err.message });
        }
        res.status(200).send("A verification email has been sent to " + email + ".");
    });
});
module.exports = router;