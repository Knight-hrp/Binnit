const DOWNVOTE = require('../models/downVote');
const UPVOTE = require('../models/upVote');
const POST = require('../models/post');
const COMMUNITY = require('../models/community');

async function handleDownVote(req, res, user, flag){
    try {
        const  post_id  = req.params.post_id;
        const  user_id  = user._id; // Get user_id from body or query params
        console.log(flag);
        
        if (!user_id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const exist_downVote = await DOWNVOTE.findOne({ user_id, post_id });
        
        if (exist_downVote) {
            // Remove existing downvote
            await DOWNVOTE.deleteOne({ user_id, post_id });
            
            // Get the post as a single document
            const post = await POST.findOne({ _id: post_id });
            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }
            
            // Decrement downvote count if greater than 0
            if (post.downVote > 0) {
                await POST.findByIdAndUpdate(post_id, { $inc: { downVote: -1 } });
            }
            
            // Get community information
            const community = await COMMUNITY.findOne({ _id: post.community_id });
            if (!community) {
                return res.status(404).json({ error: "Community not found" });
            }
            
            // Redirect based on id parameter
            if(flag === "0" || flag === "1")
            {
                return res.status(200).redirect(`/comments/${flag}/${community._id}/${post_id}`);
            }
            else if (flag === "2") {
                return res.status(200).redirect("/");
            } else if (flag === "3") {
                return res.status(200).redirect(`/community/${community.communityName}`);
            }
        } else {
            // Create new downvote
            await DOWNVOTE.create({ user_id, post_id });
            
            // Remove any existing upvote
            await UPVOTE.deleteOne({ user_id, post_id });
            
            // Get the post as a single document
            const post = await POST.findOne({ _id: post_id });
            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }
            
            // Increment downvote and decrement upvote if applicable
            await POST.findByIdAndUpdate(post_id, { $inc: { downVote: 1 } });
            if (post.upVote > 0) {
                await POST.findByIdAndUpdate(post_id, { $inc: { upVote: -1 } });
            }
            
            // Get community information
            const community = await COMMUNITY.findOne({ _id: post.community_id });
            if (!community) {
                return res.status(404).json({ error: "Community not found" });
            }
            
            // Redirect based on id parameter
            if(flag === "0" || flag === "1")
            {
                return res.status(200).redirect(`/comments/${flag}/${community._id}/${post_id}`);
            }
            else if (flag === "2") {
                return res.status(200).redirect("/");
            } else if (flag === "3") {
                return res.status(200).redirect(`/community/${community.communityName}`);
            }
        }
        
        // Default redirect if id doesn't match expected values
        return res.status(200).redirect("/");
    } catch (error) {
        console.error("Error in handleDownVote:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = { handleDownVote };
