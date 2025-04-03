const mongoose = require('mongoose');

const CommunityRoleSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    community_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
    role: { 
        type: String, 
        enum: ['admin', 'moderator', 'user'], 
        default: 'user',
        required: true 
    }
});

const COMMUNTIYROLE = mongoose.model('CommunityRole', CommunityRoleSchema);

module.exports = COMMUNTIYROLE;
