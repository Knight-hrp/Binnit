const express = require('express');
const router = express.Router();
const multer = require('multer');
const { setProfilePicture, getProfilePicture } = require('../controllers/userProfile')
const UserProfilePicture = require('../models/userProfilePicture');
const Post = require('../models/post');
const Comment = require('../models/comments');
const Community = require('../models/community');
const UpVote = require('../models/upVote');
const User = require('../models/user');
var userProfileName= "https://bootdey.com/img/Content/avatar/avatar6.png";

const storage = multer.diskStorage({
    destination: function (req,file, cb)
    {
        return cb(null, "./Uploads");
    },
    filename: function (req,file, cb)
    {
        const name = `${Date.now()}-${file.originalname}`;
        return cb (null ,name)
    }
})

const upload = multer({ storage });

router.get("/", async (req,res) => {
    try {
        // Get user profile picture
        const profile = await getProfilePicture(req.user._id);
        if(profile !== null) {
            userProfileName = profile.picture_name;
        }
        
        // Get user's upvoted posts for easy checking
        const likedPostIds = await UpVote.find({ user_id: req.user._id }).select('post_id');
        const likedPostsSet = new Set(likedPostIds.map(upvote => upvote.post_id.toString()));
        
        // Get user's posts
        const userPosts = await Post.find({ user_id: req.user._id }).sort({ createdAt: -1 });
        
        // Enhance posts with community names and like status
        for (const post of userPosts) {
            const community = await Community.findById(post.community_id);
            post.communityName = community ? community.communityName : 'Unknown Community';
            post.communityImage = community ? community.imageName : null;
            
            // Get comment count for each post
            const commentCount = await Comment.countDocuments({ post_id: post._id });
            post.commentCount = commentCount;
            
            // Check if the post is liked by the user
            post.isLiked = likedPostsSet.has(post._id.toString());
        }
        
        // Get user's comments
        const userComments = await Comment.find({ user_id: req.user._id }).sort({ createdAt: -1 });
        
        // Enhance comments with post titles and community names
        for (const comment of userComments) {
            const post = await Post.findById(comment.post_id);
            comment.postTitle = post ? post.title : 'Unknown Post';
        }
        
        // Get user's liked posts
        const likedPostsPromises = Array.from(likedPostsSet).map(async (postId) => {
            const post = await Post.findById(postId);
            if (post) {
                // Get community info
                const community = await Community.findById(post.community_id);
                post.communityName = community ? community.communityName : 'Unknown Community';
                post.communityImage = community ? community.imageName : null;
                
                // Get comment count
                const commentCount = await Comment.countDocuments({ post_id: post._id });
                post.commentCount = commentCount;
                
                // Mark as liked
                post.isLiked = true;
                
                return post;
            }
            return null;
        });
        
        const likedPosts = (await Promise.all(likedPostsPromises)).filter(post => post !== null);
        const curr_user = await User.findById(req.user._id);
        
        res.render("userProfile", {
            image: userProfileName,
            user: curr_user,
            userPosts: userPosts,
            userComments: userComments,
            likedPosts: likedPosts,
            likedPostsSet: likedPostsSet,
            curr_user: req.user,
        });
    } catch (error) {
        console.error("Error fetching user profile data:", error);
        res.status(500).render("error", { 
            message: "Error loading profile data",
            error: { status: 500 }
        });
    }
});

router.post("/upload", upload.single("profilePicture"),async(req,res) =>{
    if(!req.file)
    {
        return res.redirect("/profile");
    }
    setProfilePicture(req.user._id,req.file.filename);
    return res.redirect("/profile");
});

router.post("/update-username", async (req, res) => {
    const username = req.body.username;
    console.log(username);
    await User.findByIdAndUpdate(req.user._id, { name: username });
    res.redirect("/profile");
});

module.exports = router;