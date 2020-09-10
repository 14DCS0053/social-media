const express = require("express");
const router = express.Router();
const Token = require("../modal/token");
const User = require("../modal/user");

//verify email route
router.get("/:token", async (req, res) => {
    try {
        // check if a token is exist
        const existToken = await Token.findOne({ token: req.params.token });
        if (!existToken) {
            return res.status(400).send("No request exist , This link may be expired");
        }
        // find a user matching to this token
        const matchUser = await User.findById(existToken.user.toString());
        // check if user exist
        if (!matchUser) {
            return res.status(401).send("there is no user registered to this site");
        }
        // check if user is already verifeid
        if (matchUser.isVerified) {
            return res.status(400).send("You are already verified");
        }
        // verify the user and save it
        matchUser.isVerified = true;
        await matchUser.save();
    } catch (error) {
        res.send('server error');
        console.log(error);
    }
});
module.exports = router;