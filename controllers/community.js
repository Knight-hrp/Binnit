const COMMUNITY = require('../models/community');
const JOINCOMMUNITY = require('../models/joinCommunity')
const USER = require("../models/user");
const USERPROFILE = require("../models/userProfilePicture");
const {ChangeRole} = require('./user')
const COMMUNTIYROLE = require('../models/communityRole');

async function createCommunity(name, body, id, filepath) {
    const communityName = body.communityName;
    const aboutCommunity = body.aboutCommunity;
    return await COMMUNITY.create({
        communityName: communityName,
        aboutCommunity: aboutCommunity,
        imageName: filepath,
        createdBy: id,
    });
}

async function getCommunity(req,res){
    allCommunities = await COMMUNITY.find({});
    const joinedCommunities = await JOINCOMMUNITY.find({userID:req.user._id});  
    return res.render("community",{
        AllCom: allCommunities,
        joinedCommunities: joinedCommunities,
    })
}

async function joinCommunity(req,res){
    const community = req.params.community;
    const user_id = req.user._id;
    const exit_user_id = await JOINCOMMUNITY.findOne({communityID:community,userID:user_id});
    if(exit_user_id)
    {
        return res.status(400).send("You are already a member of this community");
    }
    const communityID = await COMMUNITY.findOne({communityName:community});
    await JOINCOMMUNITY.create({communityID:communityID._id,userID:user_id});
    return res.redirect(`/community`);
}

async function exploreCommunity(req,res)
{
    const joinedCommunities = await JOINCOMMUNITY.find({userID:req.user._id});
    const allCommunities = await COMMUNITY.find({});
    return res.render("exploreCommunity",{joinedCommunities:  joinedCommunities,allCommunities: allCommunities});
}

async function renderCreatePost(req,res)
{
    const community = req.params.community;
    return res.render("createPost",{community: community});
}
async function renderCreatePostFile(req,res)
{
    const community = req.params.community;
    return res.render("createPostFile",{community: community});
}

async function renderAssignModerator(req,res)
{
    // This controller is already protected by the isAdmin middleware
    // We can use req.communityData which is set by the middleware
    const community = req.params.community;
    const communityData = req.communityData || await COMMUNITY.findOne({communityName:community});
    
    // Get search query if provided
    const searchQuery = req.query.search || '';
    
    // Get success or error messages from query params
    const success = req.query.success;
    const error = req.query.error;
    
    // Find users with query if search is provided
    let userQuery = { _id: { $ne: req.user._id } };
    
    if (searchQuery) {
        userQuery = {
            $and: [
                { _id: { $ne: req.user._id } },
                {
                    $or: [
                        { name: { $regex: searchQuery, $options: 'i' } },
                        { email: { $regex: searchQuery, $options: 'i' } }
                    ]
                }
            ]
        };
    }
    
    const users = await USER.find(userQuery);
    const userProfiles = await USERPROFILE.find({});
    
    // Get existing moderators and admins for this community
    const communityRoles = await COMMUNTIYROLE.find({ 
        community_id: communityData._id,
        role: { $in: ['moderator', 'admin'] }
    });
    
    return res.render("assign-Moderator", {
        community_name: community, 
        users: users, 
        community: communityData, 
        userProfiles: userProfiles,
        searchQuery: searchQuery,
        success: success,
        error: error,
        communityRoles: communityRoles
    });
}



module.exports = {
    createCommunity,
    getCommunity,
    joinCommunity,
    exploreCommunity,
    renderCreatePost,
    renderCreatePostFile,
    renderAssignModerator,
}