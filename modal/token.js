const mongoose = require("mongoose");
const tokenSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: 3600 } // expire in 3600 sec = 1 hour
});
module.exports = mongoose.model("Token", tokenSchema);