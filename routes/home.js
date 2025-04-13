const USER = require("../models/user");
const PROFILEPICTURE = require("../models/userProfilePicture")
const POST = require("../models/post");
const UPVOTE = require("../models/upVote");
const COMMUNITY = require("../models/community");

async function renderHome(req,res)
{
    const post = await POST.find().sort({ createdAt: -1 });
    const user = await USER.find({});
    const community = await COMMUNITY.find({});
    const userProfile = await PROFILEPICTURE.find({}); 

    // Get the posts the user has liked, if user is logged in
    let likedPostsSet = new Set();
    if (req.user) {
        const likedPostIds = await UPVOTE.find({ user_id: req.user._id }).select('post_id');
        likedPostsSet = new Set(likedPostIds.map(upvote => upvote.post_id.toString()));
        
        // Add isLiked flag to each post
        post.forEach(p => {
            p.isLiked = likedPostsSet.has(p._id.toString());
        });
    }

    res.render("home", {
        posts: post,
        users: user,
        userProfiles: userProfile,
        community: community,
        likedPostsSet: likedPostsSet
    });
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



module.exports = {
    renderHome,
    setUpVote
}; 