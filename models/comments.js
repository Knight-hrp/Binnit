const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    community_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment_text: {
        type: String,
        required: false,
        trim: true
    },
    upVotes: {
        type: Number,
        default: 0
    },  
    downVotes: {
        type: Number,
        default: 0
    }
}, { timestamps: false });

const COMMENTS = mongoose.model('comments', commentSchema);
module.exports = COMMENTS;
