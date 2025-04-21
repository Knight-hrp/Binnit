const USER = require("../models/user");
const PROFILEPICTURE = require("../models/userProfilePicture")
const POST = require("../models/post");
const UPVOTE = require("../models/upVote");
const COMMUNITY = require("../models/community");
const DOWNVOTE = require("../models/downVote");
const COMMENTUPVOTE = require("../models/commentUpvote");
const COMMENT = require("../models/comments");

async function setUpVote(post_id, user_id)
{
    const upVote = await UPVOTE.find({post_id: post_id, user_id: user_id});
    console.log(upVote);
    if(upVote.length === 0)
    {
        await UPVOTE.create({post_id: post_id, user_id: user_id});
        const exist_downVote = await DOWNVOTE.find({post_id: post_id, user_id: user_id});
        if(exist_downVote.length > 0)
            {
                await DOWNVOTE.deleteOne({post_id: post_id, user_id: user_id});
                await POST.findByIdAndUpdate(post_id, {$inc: {downVote: -1}});
            }
        const updatedPost = await POST.findByIdAndUpdate(post_id, {$inc: {upVote: 1}}, {new: true});
        return { success: true, upvotes: updatedPost.upVote };
    }
    else
    {
        console.log(upVote);
        await UPVOTE.deleteOne({_id: upVote[0]._id});
        const updatedPost = await POST.findByIdAndUpdate(post_id, {$inc: {upVote: -1}}, {new: true});
        return { success: true, upvotes: updatedPost.upVote };
    }
}

async function upVoteComment(req,res)
{
    try {
        const comment_id = req.params.comment_id;
        const user_id = req.user._id;
        const flag = req.params.flag;
        const community_id = req.params.community_id;
        const post_id = req.params.post_id;
        const exist_upvote = await COMMENTUPVOTE.find({comment_id: comment_id, user_id: user_id});

        let isUpvoted = false;
        if(exist_upvote.length === 0)
        {
            await COMMENTUPVOTE.create({comment_id: comment_id, user_id: user_id});
            await COMMENT.findByIdAndUpdate(comment_id, {$inc: {upVotes: 1}});
            isUpvoted = true;
        }
        else
        {
            await COMMENTUPVOTE.deleteOne({_id: exist_upvote[0]._id});
            await COMMENT.findByIdAndUpdate(comment_id, {$inc: {upVotes: -1}});
            isUpvoted = false;
        }

        // Get the updated comment to return the new upvote count
        const updatedComment = await COMMENT.findById(comment_id);
        
        res.json({
            success: true,
            upvotes: updatedComment.upVotes,
            isUpvoted: isUpvoted
        });
    } catch (error) {
        console.error('Error in upVoteComment:', error);
        res.json({
            success: false,
            error: 'Failed to update vote'
        });
    }
}

async function downVoteComment(req,res)
{
    try {
        const comment_id = req.params.comment_id;
        const user_id = req.user._id;
        const flag = req.params.flag;
        const community_id = req.params.community_id;
        const post_id = req.params.post_id;
        const exist_upvote = await COMMENTUPVOTE.find({comment_id: comment_id, user_id: user_id});
        
        if(exist_upvote.length !== 0)
        {
            await COMMENTUPVOTE.deleteOne({_id: exist_upvote[0]._id});
            await COMMENT.findByIdAndUpdate(comment_id, {$inc: {upVotes: -1}});
        }

        // Get the updated comment to return the new upvote count
        const updatedComment = await COMMENT.findById(comment_id);
        
        res.json({
            success: true,
            upvotes: updatedComment.upVotes,
            isUpvoted: false
        });
    } catch (error) {
        console.error('Error in downVoteComment:', error);
        res.json({
            success: false,
            error: 'Failed to update vote'
        });
    }
}
module.exports = { setUpVote, upVoteComment, downVoteComment};