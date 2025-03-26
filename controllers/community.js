const COMMUNITY = require('../models/community');
const JOINCOMMUNITY = require('../models/joinCommunity')
const {ChangeRole} = require('./user')

async function createCommunity(name,body,id)
{
    const communityName = body.communityName;
    const aboutCommunity = body.aboutCommunity;
    await COMMUNITY.create({
        communityName: communityName,
        aboutCommunity: aboutCommunity,
        createdBy: id,
    })
    await COMMUNITY.findOneAndUpdate({communityName: communityName,
        aboutCommunity: aboutCommunity,
        createdBy: id},{imageName: "/communityImage/"+name});
}

async function getCommunity(req,res){
    allCommunities = await COMMUNITY.find({});
    const joinedCommunities = await JOINCOMMUNITY.find({userID:req.user._id});
    return res.render("community",{
        AllCom:allCommunities,
        joinedCommunities:joinedCommunities,
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
    const joinCommunity = new JOINCOMMUNITY({communityID:communityID._id,userID:user_id});
    await joinCommunity.save();
    return res.redirect(`/community/${community}`);
}

async function exploreCommunity(req,res){
    const joinedCommunities = await JOINCOMMUNITY.find({userID:req.user._id});
    const allCommunities = await COMMUNITY.find({});
    return res.render("exploreCommunity",{joinedCommunities:joinedCommunities,allCommunities:allCommunities});
}


module.exports = {
    createCommunity,
    getCommunity,
    joinCommunity,
    exploreCommunity,
}