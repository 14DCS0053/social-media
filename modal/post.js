const mongoose = require("mongoose");
const schema = mongoose.Schema;
const postSchema = new schema({
  user: { type: schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  avatar: String,
  likes: [
    {
      user: { type: schema.Types.ObjectId, ref: "User" },
      name: { type: String, required: true },
      date: { type: Date, default: Date.now }
    }
  ],
  comments: [
    {
      user: { type: schema.Types.ObjectId, ref: "User" },
      text: String,
      name: String,
      date: { type: Date, default: Date.now }
    }
  ],
  text: String,
  date: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Post", postSchema);
