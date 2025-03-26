const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema({
    communityName:{
        type: String,
        required: true,
    },
    imageName:{
        type: String,
        required: false,
        default: "https://bootdey.com/img/Content/avatar/avatar6.png",
    },
    aboutCommunity:{
        type: String,
        required: true,
    },
    createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
    },
})

const COMMUNITY = mongoose.model("communities",CommunitySchema);
module.exports = COMMUNITY;