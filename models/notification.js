const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    type: {
        type: String,
        required: true,
        enum: ['COMMENT', 'UPVOTE', 'DOWNVOTE', 'MENTION', 'COMMUNITY_INVITE', 'SYSTEM', 'REMOVE_USER', 'NEW_POST']
    },
    content: {
        type: String,
        required: true
    },
    relatedPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    },
    relatedComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comments'
    },
    relatedCommunity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'community'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const NOTIFICATION = mongoose.model('notification', notificationSchema);
module.exports = NOTIFICATION; 