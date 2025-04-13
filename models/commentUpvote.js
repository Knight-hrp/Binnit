const mongoose = require("mongoose");

const commentUpvoteSchema = new mongoose.Schema({
    comment_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comments",
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
    },
});

const COMMENTUPVOTE = mongoose.model("COMMENTUPVOTE", commentUpvoteSchema);
module.exports = COMMENTUPVOTE;
