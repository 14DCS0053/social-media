const errHandle = (res, error, msg = "") => {
  if (error.kind == "ObjectId") {
    res.status(400).json({ msg });
  } else {
    res.status(500).json({ msg: "server error" });
    console.log(error);
  }
};
module.exports = errHandle;
