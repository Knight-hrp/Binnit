const COMMUNITY = require('../models/community');
const JOINCOMMUNITY = require('../models/joinCommunity')
const {ChangeRole} = require('./user')

async function createCommunity(name,body,id,filepath)
{
    const communityName = body.communityName;
    const aboutCommunity = body.aboutCommunity;
    await COMMUNITY.create({
        communityName: communityName,
        aboutCommunity: aboutCommunity,
        imageName: filepath,
        createdBy: id,
    })
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


module.exports = {
    createCommunity,
    getCommunity,
    joinCommunity,
    exploreCommunity,
    renderCreatePost,
    renderCreatePostFile,
}