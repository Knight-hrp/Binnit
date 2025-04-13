const express = require('express');
const multer = require('multer');

const { createCommunity, getCommunity,joinCommunity, exploreCommunity, renderCreatePost, renderCreatePostFile, renderAssignModerator, searchCommunity } = require('../controllers/community');

const router = express.Router();

const JOINCOMMUNITY = require('../models/joinCommunity');
const POST = require('../models/post');
const COMMUNITY = require('../models/community');
const USER = require('../models/user');
const USERPROFILE = require('../models/userProfilePicture');
const COMMUNTIYROLE = require('../models/communityRole');
const path = require('path');
const {} = require('../socketHandler')
const UPVOTE = require('../models/upVote');
const COMMENTS = require('../models/comments')



const storage = multer.diskStorage({
    destination: function (req,file, cb)
    {
        return cb(null, "./communityImage");
    },
    filename: function (req,file, cb)
    {
        const name = `${Date.now()}-${file.originalname}`;
        return cb (null ,name)
    }
})

const upload = multer({ storage });

router.get("/",getCommunity);

router.get("/addCommunity",(req,res)=>{
    res.render("addCommunity",{curr_user: req.user});
});

router.post("/search",searchCommunity);

router.get("/join/:community",joinCommunity);

router.post("/addCommunity",upload.single("image"),async (req,res)=>{
    const path = '/communityImage/' + req.file.filename;
    await createCommunity(req.file.filename, req.body , req.user._id, path);
    
    // Find the newly created community to get its ID
    const community = await COMMUNITY.findOne({communityName: req.body.communityName});
    if (!community) {
        return res.status(500).send("Error creating community");
    }

    // Create admin role for the user
    await COMMUNTIYROLE.create({
        user_id: req.user._id,
        community_id: community._id,
        role: 'admin'
    });
    await JOINCOMMUNITY.create({
        communityID: community._id,
        userID: req.user._id
    });
    return res.redirect("/community",);
});

router.get("/explore",exploreCommunity)

router.get('/:community',async (req,res)=>{
    try {
        const community = await COMMUNITY.findOne({communityName: req.params.community});
        if (!community) {
            return res.status(404).send("Community not found");
        }
        const communityPost = await POST.find({community_id: community._id});
        const users = await USER.find({});
        const userProfiles = await USERPROFILE.find({});
        
        // Check if current user is admin
        let isAdmin = false;
        
        // Get community roles (for checking moderators)
        let communityRoles = [];
        
        // Get user's liked posts
        let likedPostsSet = new Set();
        
        if (req.user) {
            // Check for admin role
            const adminRole = await COMMUNTIYROLE.findOne({
                user_id: req.user._id,
                community_id: community._id,
                role: 'admin'
            });
            isAdmin = !!adminRole;
            
            // Get all moderator and admin roles for this community
            communityRoles = await COMMUNTIYROLE.find({
                community_id: community._id,
                role: { $in: ['admin', 'moderator'] }
            });
            
            // Get liked posts
            const likedPostIds = await UPVOTE.find({ user_id: req.user._id }).select('post_id');
            likedPostsSet = new Set(likedPostIds.map(upvote => upvote.post_id.toString()));
            
            // Add isLiked flag to each post
            communityPost.forEach(post => {
                post.isLiked = likedPostsSet.has(post._id.toString());
            });
        }

        const upVote = await UPVOTE.find({user_id: req.user._id});
        
        res.render("insideCommunity",{
            Community: req.params.community,
            posts: communityPost,
            userProfiles: userProfiles,
            users: users,
            community: community,
            isAdmin: isAdmin,
            communityRoles: communityRoles,
            req: req,
            upvotes: upVote,
            curr_user: req.user,
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.post("/:community/postText",async (req,res)=>{
    try {
        const communityID = await COMMUNITY.findOne({communityName: req.params.community});
        if (!communityID) {
            return res.status(404).send("Community not found");
        }

        const post = await POST.create({
            title: req.body.title,
            postText: req.body.postText,
            community_id: communityID._id,
            user_id: req.user._id,
            upVote: 0
        });

        return res.redirect(`/community/${req.params.community}`);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).send("Error creating post: " + error.message);
    }
});

router.post("/:community/postFile",upload.single("image"),async(req,res)=>{
    try {
        if(!req.file) {
            return res.status(400).send("No file uploaded");
        }
        console.log("File received:", req.file.filename);
        console.log("Caption received:", req.body.caption);
        
        const filePath = `/communityImage/${req.file.filename}`;
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        const room = req.params.community;
        const communityID = await COMMUNITY.findOne({communityName: req.params.community});
        
        if (!communityID) {
            return res.status(404).send("Community not found");
        }

        const post = await POST.create({
            title: req.body.caption,
            path: filePath,
            community_id: communityID._id,
            user_id: req.user._id,
            caption: req.body.content,
        });

        // Emit the new media event for real-time updates
        global.io.to(room).emit("newMedia", {
            filePath,
            extension: fileExtension
        }); 

        // Redirect back to the community page
        return res.redirect(`/community/${req.params.community}`);
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).send("Error uploading file: " + error.message);
    }
});


router.get("/post/create/:community",renderCreatePost);
router.get("/post/createFile/:community",renderCreatePostFile);

// Middleware to check if user is admin of the community
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).send("You must be logged in to access this page");
        }
        
        const community = await COMMUNITY.findOne({ communityName: req.params.community });
        if (!community) {
            return res.status(404).send("Community not found");
        }
        
        // Check if user is admin for this community
        const adminRole = await COMMUNTIYROLE.findOne({
            user_id: req.user._id,
            community_id: community._id,
            role: 'admin'
        });
        
        if (!adminRole) {
            return res.status(403).send("Only community admins can assign moderators");
        }
        
        // Add community to the request object for later use
        req.communityData = community;
        next();
    } catch (error) {
        console.error("Error checking admin status:", error);
        return res.status(500).send("Server error");
    }
};

// Protect the assign moderator routes with the isAdmin middleware
router.get("/:community/assign-moderator", isAdmin, renderAssignModerator);
router.get("/:community/set-moderator/:userId", isAdmin, async (req, res) => {
    try {
        const communityName = req.params.community;
        const userId = req.params.userId;
        
        // Use the community from the middleware if available
        const community = req.communityData || await COMMUNITY.findOne({ communityName: communityName });
        if (!community) {
            return res.status(404).send("Community not found");
        }
        
        // Check if user is already a moderator
        const existingRole = await COMMUNTIYROLE.findOne({ 
            user_id: userId, 
            community_id: community._id 
        });
        
        if (existingRole) {
            if (existingRole.role === 'moderator') {
                // The user is already a moderator, redirect with query parameter to show message
                return res.redirect(`/community/${communityName}/assign-moderator?error=existing`);
            } else if (existingRole.role === 'admin') {
                // The user is already an admin, redirect with query parameter
                return res.redirect(`/community/${communityName}/assign-moderator?error=admin`);
            }
            
            // Update existing role to moderator
            existingRole.role = 'moderator';
            await existingRole.save();
        } else {
            // Create new role entry
            await COMMUNTIYROLE.create({
                user_id: userId,
                community_id: community._id,
                role: 'moderator'
            });
        }
        
        // Check if the user is already a member of the community
        const existingMembership = await JOINCOMMUNITY.findOne({
            communityID: community._id,
            userID: userId
        });
        
        // If not already a member, add them to the community
        if (!existingMembership) {
            await JOINCOMMUNITY.create({
                communityID: community._id,
                userID: userId
            });
        }
        
        // Redirect to the moderator assignment page with success message
        return res.redirect(`/community/${communityName}/assign-moderator?success=true`);
        
    } catch (error) {
        console.error("Error assigning moderator:", error);
        return res.status(500).send("Error assigning moderator: " + error.message);
    }
});

// Middleware to check if user can modify post (post owner, admin, or moderator)
const canModifyPost = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).send("You must be logged in to modify posts");
        }
        
        const postId = req.params.postId;
        const post = await POST.findById(postId);
        
        if (!post) {
            return res.status(404).send("Post not found");
        }
        
        // Store post for later use
        req.post = post;
        
        // Check if user is post owner
        const isPostOwner = post.user_id.toString() === req.user._id.toString();
        
        if (isPostOwner) {
            return next(); // Post owners can always modify their own posts
        }
        
        // Check if user is admin or moderator for this community
        const community = await COMMUNITY.findOne({ communityName: req.params.community });
        if (!community) {
            return res.status(404).send("Community not found");
        }
        
        const moderatorRole = await COMMUNTIYROLE.findOne({
            user_id: req.user._id,
            community_id: community._id,
            role: { $in: ['admin', 'moderator'] }
        });
        
        if (!moderatorRole) {
            return res.status(403).send("You don't have permission to modify this post");
        }
        
        next();
    } catch (error) {
        console.error("Error checking post modification permissions:", error);
        return res.status(500).send("Server error");
    }
};

// Route to show the edit post form
router.get('/:community/edit-post/:postId', canModifyPost, async (req, res) => {
    try {
        const post = req.post; // From middleware
        const community = await COMMUNITY.findOne({ communityName: req.params.community });
        
        if (post.path) {
            // Render file edit form
            return res.render('editPostFile', {
                post: post,
                community: community,
                community_name: req.params.community
            });
        } else {
            // Render text post edit form
            return res.render('editPost', {
                post: post,
                community: community,
                community_name: req.params.community,
                curr_user: req.user,
            });
        }
    } catch (error) {
        console.error("Error rendering edit post form:", error);
        return res.status(500).send("Error loading edit form: " + error.message);
    }
});

// Route to handle post edit submission (text post)
router.post('/:community/edit-post/:postId', canModifyPost, async (req, res) => {
    try {
        const post = req.post; // From middleware
        
        // Update post with new data
        post.title = req.body.title;
        post.postText = req.body.postText;
        
        await post.save();
        
        return res.redirect(`/community/${req.params.community}`);
    } catch (error) {
        console.error("Error updating post:", error);
        return res.status(500).send("Error updating post: " + error.message);
    }
});

// Route to handle file post edit submission
router.post('/:community/update-file-post/:postId', canModifyPost, upload.single("file"), async (req, res) => {
    try {
        const post = req.post; // From middleware
        
        // Update post data
        post.title = req.body.title;
        post.caption = req.body.caption;
        
        // If a new file was uploaded, update the path
        if (req.file) {
            const filePath = `/communityImage/${req.file.filename}`;
            post.path = filePath;
        }
        
        await post.save();
        
        return res.redirect(`/community/${req.params.community}`);
    } catch (error) {
        console.error("Error updating file post:", error);
        return res.status(500).send("Error updating post: " + error.message);
    }
});

// Route to delete a post
router.get('/:community/delete-post/:postId', canModifyPost, async (req, res) => {
    try {
        const post = req.post; // From middleware
        
        // Delete the post
        await POST.findByIdAndDelete(post._id);

        await COMMENTS.deleteMany({post_id:post._id}).then(result => {
            console.log(`${result.deletedCount} users deleted`);
          })
          .catch(err => {
            console.error("Error deleting users:", err);
          });
        
        return res.redirect(`/community/${req.params.community}`);
    } catch (error) {
        console.error("Error deleting post:", error);
        return res.status(500).send("Error deleting post: " + error.message);
    }
});

// Route to handle leaving a community
router.get('/leave/:community', async (req, res) => {
    try {
        // Check if user is logged in
        if (!req.user) {
            return res.status(401).send("You must be logged in to leave a community");
        }
        
        // Find the community
        const community = await COMMUNITY.findOne({ communityName: req.params.community });
        if (!community) {
            return res.status(404).send("Community not found");
        }
        
        // Check if user is the admin of the community
        const adminRole = await COMMUNTIYROLE.findOne({
            user_id: req.user._id,
            community_id: community._id,
            role: 'admin'
        });
        
        if (adminRole) {
            // Redirect with error - admins can't leave their own community
            return res.redirect(`/community/${req.params.community}?error=admin_leave`);
        }
        
        // Find and remove the user's membership
        await JOINCOMMUNITY.findOneAndDelete({
            communityID: community._id,
            userID: req.user._id
        });
        
        // Remove any moderator role they might have
        await COMMUNTIYROLE.findOneAndDelete({
            user_id: req.user._id,
            community_id: community._id
        });
        
        // Redirect to communities page
        return res.redirect('/community');
        
    } catch (error) {
        console.error("Error leaving community:", error);
        return res.status(500).send("Error leaving community: " + error.message);
    }
});
    
module.exports = router;