const { secret } = require("../config");
const jwt = require("jsonwebtoken");
const user = require("../modal/user");
module.exports = async (req, res, next) => {
    console.log("liwjieg");
    if ((req.header("token") == undefined)) {
        console.log('token not');
        return res.status(401).json({ msg: "yvunauthorised acesss" });
    }

    else {
        try {
            var decoded = await jwt.verify(req.header("token"), secret);
            const currentUser = await user.findById(decoded.user.id);
            if (!currentUser)
                return res.status(401).json({ msg: "unauthorised acesss", unAuth: true });
            if (!(currentUser.isVerified)) {
                return res.status(401).json({ msg: "please verify your account", unAuth: true })
            }
            req.currentUser = {};
            req.currentUser.id = currentUser.id;
            req.currentUser.name = currentUser.name;
            if (currentUser.avatar) {
                req.currentUser.avatar = currentUser.avatar;
            }
            next();
        } catch (error) {
            console.log(error);
            return res.status(401).json({ msg: "unauthorised acesssiubi" });
        }
    }
};