const DOWNVOTE = require('../models/downVote');
const UPVOTE = require('../models/upVote');
const POST = require('../models/post');
const COMMUNITY = require('../models/community');

async function handleDownVote(req, res, user, flag){
    try {
        const post_id = req.params.post_id;
        const user_id = user._id;
        
        if (!user_id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const exist_downVote = await DOWNVOTE.findOne({ user_id, post_id });
        const exist_upvote = await UPVOTE.findOne({ user_id, post_id });
        
        if (exist_downVote) {
            // Remove existing downvote
            await DOWNVOTE.deleteOne({ user_id, post_id });
            
            const post = await POST.findOne({ _id: post_id });
            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }
            
            // Decrement downvote count if greater than 0
            if (post.downVote > 0) {
                const updatedPost = await POST.findByIdAndUpdate(post_id, 
                    { $inc: { downVote: -1 } }, 
                    { new: true }
                );
                return res.json({ 
                    success: true, 
                    downvotes: updatedPost.downVote,
                    upvotes: updatedPost.upVote,
                    isDownvoted: false,
                    isUpvoted: exist_upvote ? true : false
                });
            }
        } else {
            // Create new downvote
            await DOWNVOTE.create({ user_id, post_id });
            
            let upvoteRemoved = false;
            // Remove any existing upvote
            if (exist_upvote) {
                await UPVOTE.deleteOne({ user_id, post_id });
                upvoteRemoved = true;
            }
            
            const post = await POST.findOne({ _id: post_id });
            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }
            
            // Increment downvote and decrement upvote if applicable
            let updateQuery = { $inc: { downVote: 1 } };
            if (upvoteRemoved && post.upVote > 0) {
                updateQuery.$inc.upVote = -1;
            }
            
            const updatedPost = await POST.findByIdAndUpdate(post_id, 
                updateQuery, 
                { new: true }
            );
            
            return res.json({ 
                success: true, 
                downvotes: updatedPost.downVote,
                upvotes: updatedPost.upVote,
                isDownvoted: true,
                isUpvoted: false
            });
        }
    } catch (error) {
        console.error("Error in handleDownVote:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { handleDownVote };
