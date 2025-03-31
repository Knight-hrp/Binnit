const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    community_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    postText: {
        type: String,
    },
    path: {
        type: String,
    },
    caption: {
        type: String, 
    },
    upVote: {
        type: Number,
        default: 0,
    },
    downVote: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: false
});

const POST = mongoose.model('posts', postSchema);

module.exports = POST;
