const mongoose = require("mongoose");
const joinCommunitySchema = new mongoose.Schema({
    communityID:{
        type:String,
        required: true,
    },
    userID:{
        type:String,
        required: true,
    },
})

const JOINCOMMUNITY = mongoose.model("joinCommunities",joinCommunitySchema);
module.exports = JOINCOMMUNITY;