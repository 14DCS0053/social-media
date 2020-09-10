const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const post = require("../modal/post");
const user = require("../modal/user");
const path = require("path");
const fs = require("fs");
const serverErrHandle = require("../serverErHandle");

// GET ALL POSTS

router.get("/", auth, async (req, res) => {
    try {
        const posts = await post.find({});
        res.json({ posts });
    } catch (error) {
        serverErrHandle(res, error, "server error !!");
    }
});

// GET A POST PIC

router.get("/postPic/:id", async (req, res) => {
    // check if post exist
    try {
        const currentPost = await post.findById(req.params.id);
        if (!currentPost) {
            return res.status(404).json({ msg: "post does not found!!" });
        }
        // cheack if post have picture
        if (!currentPost.avatar) {
            return res.status(400).json({ msg: "this post does not have a picture" });
        }
        // find the picture in folder
        const avatarPath = `./upload/post/${currentPost.avatar}`;
        if (!fs.existsSync(avatarPath)) {
            return res.status(404).json({ msg: "post picture doest not found" });
        }
        // send  post picture
        res.sendFile(`${currentPost.avatar}`, {
            root: path.join(__dirname, "../upload/post")
        });
    } catch (error) {
        serverErrHandle(res, error, "invalid post id entered!!");
    }
});

//GET A POST

router.get("/:id", auth, async (req, res) => {
    try {
        const post = await post.findById(req.params.id);
        if (!post) return req.status(401).json({ msg: "post not found" });
        res.json(post);
    } catch (error) {
        serverErrHandle(res, error, "invalid post id entered!!");
    }
});

// ADD A POST

router.post("/", auth, async (req, res) => {
    try {
        // let user doest not upload  post image
        var decision = false;
        // verify if user uploaded post picture
        if (req.files) {
            if (req.files.avatar) {
                decision = true;
            }
        }
        const { text } = req.body;
        // check if both post text and post image has been not uploaded
        if (!(text || decision)) {
            return res.status(400).json({ msg: "post text or post image is required" });
        }
        const { id } = req.currentUser;
        const newPost = new post({
            user: id,
            name: req.currentUser.name
        });

        // if post picture uploaded
        if (decision) {
            var avatar = req.files.avatar;
            var avatarName = avatar.name;
            //find no of post of this user
            var noOfPost = await post.find({ user: id });
            var lenght = noOfPost.length;
            var extension = avatarName.substring(avatarName.lastIndexOf("."));
            var avatarPath = `./upload/post/${id}${lenght + 1}${extension}`;
            avatar.mv(avatarPath, err => {
                if (err) {
                    return res.status(500).json({ msg: "error whille loading file" });
                }
            });
            newPost.avatar = `${id}${lenght + 1}${extension}`;
        }
        // if post text is uploaded
        if (text) {
            newPost.text = text;
        }
        await newPost.save();
        res.json({ msg: "successfully post" });
    } catch (error) {
        serverErrHandle(res, error, "server error");
    }
});

//DELETE A POST

router.delete("/:id", auth, async (req, res) => {
    try {
        const currentPost = await post.findById(req.params.id);
        if (!currentPost) {
            return res.status(404).json({ msg: "post does not found" });
        }
        // cheack if valid user
        if (!(currentPost.user.toString() === req.currentUser.id)) {
            return res.status(403).json({ msg: "you are not autherized to delete others post" });
        }
        // cheack if this post has a image
        if (currentPost.avatar) {
            const path = currentPost.avatar;
            const finalpath = `./upload/post/${path}`;
            if (fs.existsSync(finalpath)) {
                //delete existing file
                fs.unlinkSync(finalpath);
            }
            // remove file path from currentPost
            currentPost.avatar = undefined;
        }
        await currentPost.remove();
        res.json({ msg: "successfully delted post" });
    } catch (error) {
        serverErrHandle(res, error, "invalid post id entered!!");
    }
});

// ADD A COMMENT TO A POST

router.post("/comment/:id", auth, async (req, res) => {
    if (!req.body.text) {
        return res.status(400).json({ msg: "comment is required" });
    }
    try {
        const currentPost = await post.findById(req.params.id);
        // check if post exist
        if (!currentPost) {
            return res.status(404).json({ msg: "post doest found" });
        }
        const { id, name } = req.currentUser;
        const newComment = {
            user: id,
            name: name,
            text: req.body.text
        };
        currentPost.comments.unshift(newComment);
        await currentPost.save();
        res.json({ msg: "sucessfully added comment", post: currentPost });
    } catch (error) {
        serverErrHandle(res, error, "invalid post id entered!!");
    }
});

// DELETE A COMMENT FROM A POST

router.delete("/comment/:id/:commentId", auth, async (req, res) => {
    var currentUser;
    var currentPost;

    try {
        currentPost = await post.findById(req.params.id);
        //check if post exist
        if (!currentPost) {
            return res.status(400).json({ msg: "Post doest not found" });
        }
        const currentComment = currentPost.comments.find(item => item.id === req.params.commentId);
        if (!currentComment) {
            return res.status(404).json({ msg: "comment not found" });
        }
        if (!(req.currentUser.id === currentPost.user.toString() || req.currentUser.id === currentComment.user.toString())) {
            return res.status(403).json({ msg: "You are not authorized to delete this comment" });
        }
        currentPost.comments = currentPost.comments.filter(comment => comment.id.toString() !== currentComment.id.toString());
        await currentPost.save();
        res.json({ msg: "sucessfully deleted comment", post: currentPost });
    } catch (error) {
        serverErrHandle(res, error, "invalid post id or comment id entered!!");
    }
});

// LIKE A POST

router.post("/like/:id", auth, async (req, res) => {
    try {
        const currentPost = await post.findById(req.params.id);
        //check if post exist
        if (!currentPost) {
            return res.status(404).json({ msg: "post does not found!!" });
        }
        // check if already liked
        const liked = currentPost.likes.find(like => like.user.toString() === req.currentUser.id);
        if (liked) {
            return res.status(400).json({ msg: "you have already liked this post" });
        }
        //make a like object
        const { user, name } = req.currentUser;
        const newLike = { name, user, user: req.currentUser.id };
        //like the post
        currentPost.likes.push(newLike);
        await currentPost.save();
        res.json({ msg: "sucessfully liked this post" });
    } catch (error) {
        serverErrHandle(res, error, "invalid post id entered!!");
    }
});

// UNLIKE A POST

router.delete("/like/:id", auth, async (req, res) => {
    try {
        // check if post exist
        const currentPost = await post.findById(req.params.id);
        if (!currentPost) {
            return res.status(404).json({ msg: "post does not found!!" });
        }
        // check if liked this post
        const likeIndex = currentPost.likes.findIndex(like => like.user.toString() === req.currentUser.id);
        if (likeIndex == -1) {
            return res.status(400).json({ msg: "you have not liked this post yet" });
        }
        //unlike this post
        currentPost.likes.splice(likeIndex, 1);
        await currentPost.save();
        res.json({ msg: "you have sucessfully unliked this post" });
    } catch (error) {
        serverErrHandle(res, error, "invalid post id entered!!");
    }
});
module.exports = router;