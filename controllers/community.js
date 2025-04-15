const COMMUNITY = require('../models/community');
const JOINCOMMUNITY = require('../models/joinCommunity')
const USER = require("../models/user");
const USERPROFILE = require("../models/userProfilePicture");
const {ChangeRole} = require('./user')
const COMMUNTIYROLE = require('../models/communityRole');

async function createCommunity( name, body, id, filepath) {
    const communityName = body.communityName;
    const aboutCommunity = body.aboutCommunity;

      if (!communityName || !aboutCommunity) {
        console.error("Missing required fields: communityName or aboutCommunity");
        return;
    }

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
        curr_user: req.user,
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
    return res.render("exploreCommunity",{joinedCommunities:  joinedCommunities,allCommunities: allCommunities, curr_user: req.user});
}

async function renderCreatePost(req,res)
{
    const community = req.params.community;
    return res.render("createPost",{community: community, curr_user: req.user});
}
async function renderCreatePostFile(req,res)
{
    const community = req.params.community;
    return res.render("createPostFile",{community: community, curr_user:req.user});
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
        communityRoles: communityRoles,
        curr_user: req.user,
    });
}

async function searchCommunity(req, res) {
    let searchQuery = req.body.search || "";  // fallback to empty string
    searchQuery = String(searchQuery).trim();  // ensure it's a string and trim whitespace
    const referer = req.headers.referer || '';

    // If search is empty, redirect back to appropriate page
    if (!searchQuery) {
        if (referer.includes('/explore')) {
            return res.redirect('/community/explore');
        } else {
            return res.redirect('/community');
        }
    }

    try {
        const communities = await COMMUNITY.find({
            communityName: { $regex: searchQuery, $options: 'i' }
        });

        const joinedCommunities = await JOINCOMMUNITY.find({ userID: req.user._id });

        // Determine which template to render based on referer
        if (referer.includes('/explore')) {
            return res.render("exploreCommunity", {
                searchResults: communities,
                joinedCommunities: joinedCommunities,
                allCommunities: communities,
                searchQuery: searchQuery,
                curr_user: req.user,
            });
        } else {
            return res.render("community", {
                AllCom: communities,
                joinedCommunities: joinedCommunities,
                searchQuery: searchQuery,
                isSearchResult: true,
                curr_user: req.user
            });
        }
    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).send("Server error while searching.");
    }
}


module.exports = {
    createCommunity,
    getCommunity,
    joinCommunity,
    exploreCommunity,
    renderCreatePost,
    renderCreatePostFile,
    renderAssignModerator,
    searchCommunity,
}