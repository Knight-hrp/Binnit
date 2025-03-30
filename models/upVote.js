const mongoose = require("mongoose");

const upvoteSchema = new mongoose.Schema(
  {
    post_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: false }
);

const UPVOTE = mongoose.model("Upvote", upvoteSchema);
module.exports = UPVOTE;