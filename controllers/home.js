const USER = require("../models/user");
const PROFILEPICTURE = require("../models/userProfilePicture")
const POST = require("../models/post");
const UPVOTE = require("../models/upVote");
const COMMUNITY = require("../models/community");
const DOWNVOTE = require("../models/downVote");

async function renderHome(req,res)
{
    const post = await POST.find().sort({ createdAt: -1 });
    const user = await USER.find({});
    const community = await COMMUNITY.find({});
    const userProfile = await PROFILEPICTURE.find({});
    const userUid = req.cookies?.uid; 
    if (!userUid) {
        return res.render("home",{posts: post,users:user,userProfiles: userProfile,community: community});
    }
    else
    {
        const { getUser } = require("../service/auth")
        const curr_user = getUser(userUid);
        const liked = await UPVOTE.find({user_id: curr_user._id});
        console.log(liked);
        return res.render("home",{posts: post,users:user,userProfiles: userProfile,community: community,upvotes: liked, curr_user: curr_user});
    }
}

async function setUpVote(post_id, user_id)
{
    const upVote = await UPVOTE.find({post_id: post_id, user_id: user_id});
    if(upVote.length === 0)
    {
        await UPVOTE.create({post_id: post_id, user_id: user_id});
        await POST.findByIdAndUpdate( post_id, {$inc: {upVote: 1}});
        const exist_downVote = await DOWNVOTE.find({post_id: post_id, user_id: user_id});
        if(exist_downVote.length > 0)
        {
            await DOWNVOTE.deleteOne({post_id: post_id, user_id: user_id});
            await POST.findByIdAndUpdate(post_id, {$inc: {downVote: -1}});
        }
    }
    else
    {
        await UPVOTE.deleteOne({_id: upVote[0]._id});
        await POST.findByIdAndUpdate(post_id, {$inc: {upVote: -1}});
    }
}

module.exports = {renderHome};