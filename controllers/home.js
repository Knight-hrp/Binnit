const USER = require("../models/user");
const PROFILEPICTURE = require("../models/userProfilePicture")
const POST = require("../models/post");
const UPVOTE = require("../models/upVote");

async function renderHome(req,res)
{
    const post = await POST.find({}).sort({ upVote: -1 });
    const user = await USER.find({});
    const userProfile = await PROFILEPICTURE.find({}); 
    res.render("home",{posts: post,users:user,userProfiles: userProfile});
}

async function setUpVote(post_id, user_id)
{
    const upVote = await UPVOTE.find({post_id: post_id, user_id: user_id});
    if(upVote.length === 0)
    {
        await UPVOTE.create({post_id: post_id, user_id: user_id});
        await POST.findByIdAndUpdate( post_id, {$inc: {upVote: 1}});
    }
    else
    {
        await UPVOTE.deleteOne({_id: upVote[0]._id});
        await POST.findByIdAndUpdate(post_id, {$inc: {upVote: -1}});
    }
}

module.exports = {renderHome, setUpVote};