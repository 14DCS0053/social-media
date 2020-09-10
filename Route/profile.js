const express = require("express");
const router = express.Router();
const user = require("../modal/user");
const auth = require("../middleware/auth");
const post = require("../modal/post");
const path = require("path");
const fs = require("fs");
const serverErrHandle = require("../serverErHandle");

//GET PUBLBIC PROFILE WITH POST

router.get("/:id", auth, async (req, res) => {
    try {
        const userDetail = await user.findById(req.params.id);
        const posts = await post.find({ user: req.params.id });
        res.json({ user: userDetail, posts });
    } catch (error) {
        serverErrHandle(res, error, "invalid user id entered !!");
    }
});

// GET MY PROFILE WITH POST
router.get("/myProfile", auth, async (req, res) => {
    try {
        const { id, name } = req.currentUser;
        const me = { id, name };
        const myPost = await post.find({ user: req.currentUser.id });
        res.json({ me, myPost });
    } catch (error) {
        serverErrHandle(res, error, "server error !!");
    }
});

//GET PROFILE PICTURE

router.get("/profilePic/:id", async (req, res) => {
    try {
        var currentUser = await user.findById(req.params.id);
        if (!currentUser) {
            return res.status(404).json({ msg: "user doestn exist" });
        }
    } catch (error) {
        serverErrHandle(res, error, "invalid user id entered !!");
    }
    // send default image if no profile picture
    if (!currentUser.avatar) {
        return res.sendFile("default.png", { root: path.join(__dirname, "../upload/profile") });
    }
    var avatar = currentUser.avatar;
    var imgPath = `./upload/profile/${avatar}`;
    // cheack if user has profile picture
    try {
        if (!fs.existsSync(imgPath)) {
            return res.status(500).json({ msg: "image not found" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "server error" });
    }
    res.sendFile(`${avatar}`, { root: path.join(__dirname, "../upload/profile") });
});

//UPDATE PROFILE PICTURE

router.post("/:id", auth, async (req, res) => {
    // cheack if correct user
    if (req.params.id !== req.currentUser.id) {
        return res.status(403).json({ msg: "You are not authorized to update others profile picture" });
    }
    // check if user uploaded a profile
    if (!req.files) {
        return res.status(400).json({ msg: "please upload profile pic" });
    }
    // cheack if user has already a profile pic
    try {
        const currentUser = await user.findById(req.currentUser.id);
        if (currentUser.avatar) {
            const path = currentUser.avatar;
            const finalpath = `./upload/profile/${path}`;
            if (fs.existsSync(finalpath)) {
                //delete existing file
                fs.unlinkSync(finalpath);
            }
        }
        //new profile pic
        const profilePic = req.files.avatar;
        const profileName = profilePic.name;
        const imagepath = `./upload/profile/${currentUser.id}${profileName.substring(profileName.lastIndexOf("."))}`;
        //move profile pic to folder
        profilePic.mv(imagepath, async err => {
            if (err) {
                return res.status(500).json({ msg: "server error" });
            }
            currentUser.avatar = `${currentUser.id}${profileName.substring(profileName.lastIndexOf("."))}`;
            await currentUser.save();
            res.json({ msg: "successfully uploaded" });
        });
    } catch (error) {
        console.log(error);
        serverErrHandle(res, error, "invalid user id entered !!");
    }
});

// DELETE PROFILE PICTURE

router.delete("/:id", auth, async (req, res) => {
    // cheack if authorized user
    if (!(req.currentUser.id === req.params.id)) {
        return res.status(403).json({ msg: "you are not authorized to delete other's profile picture" });
    }
    // cheack if user has profile picture
    if (!req.currentUser.avatar) {
        return res.status(400).json({ msg: "You have no profile picture to delete" });
    }
    // find the path in folder
    const avatar = req.currentUser.avatar;
    const imgPath = `./upload/profile/${avatar}`;

    //cheack if file exist in folder
    if (fs.existsSync(imgPath)) {
        try {
            fs.unlinkSync(imgPath); //delete existing file
        } catch (error) {
            console.log(error);
            return res.status(500).json({ msg: "error while deleting your profile picture" });
        }
    }
    try {
        const currentUser = await user.findById(req.currentUser.id);
        currentUser.avatar = undefined;
        await currentUser.save();
    } catch (error) {
        serverErrHandle(res, error, "invalid user id entered !!");
    }
    res.json({ msg: "successfully deleted profile picture" });
});
module.exports = router;