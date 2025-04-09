const mongoose = require('mongoose');

const downVoteSchema = new mongoose.Schema({
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: false });

const DOWNVOTE = mongoose.model('downvote', downVoteSchema);

module.exports = DOWNVOTE;


