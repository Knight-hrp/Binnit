const express = require('express');
const multer = require('multer');

const { createCommunity, getCommunity,joinCommunity, exploreCommunity, renderCreatePost, renderCreatePostFile, renderAssignModerator, searchCommunity, deassignModerator } = require('../controllers/community');

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
const NOTIFICATION = require('../models/notification');



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
    try {
        if (!req.user) {
            return res.status(401).send("You must be logged in to create a community");
        }

        let imagePath;
        if (!req.file) {
            imagePath = 'https://bootdey.com/img/Content/avatar/avatar6.png';
        } else {
            imagePath = '/communityImage/' + req.file.filename;
        }

        await createCommunity(req, req.user._id, imagePath);
        
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

        // Add user to community members
        await JOINCOMMUNITY.create({
            communityID: community._id,
            userID: req.user._id
        });

        // Find all developers to notify them
        const developers = await USER.find({ role: 'DEVELOPER' });

        // Create notifications for each developer
        const developer = await USER.findOne({role: 'Developer'});

            await NOTIFICATION.create({
                recipient: developer._id,
                sender: req.user._id,
                type: 'SYSTEM',
                content: `A new community "${req.body.communityName}" has been created by ${req.user.name}`,
                relatedCommunity: community._id,
                isRead: false
            });
        

        return res.redirect("/community");
    } catch (error) {
        console.error("Error creating community:", error);
        return res.status(500).send("Error creating community: " + error.message);
    }
});

router.get("/explore",exploreCommunity)

router.get('/:community',async (req,res)=>{
    try {
        const community = await COMMUNITY.findOne({communityName: req.params.community});
        if (!community) {
            return res.status(404).send("Community not found");
        }
        const communityPost = await POST.find({community_id: community._id}).sort({createdAt: -1});
        const users = await USER.find({});
        const userProfiles = await USERPROFILE.find({});
        
        // Check if current user is admin
        let isAdmin = false;
        let isModerator = false;
        
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
            
            // Check for moderator role
            const moderatorRole = await COMMUNTIYROLE.findOne({
                user_id: req.user._id,
                community_id: community._id,
                role: 'moderator'
            });
            isModerator = !!moderatorRole;
            
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
            isModerator: isModerator,
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

         await POST.create({
            title: req.body.title,
            postText: req.body.postText,
            community_id: communityID._id,
            user_id: req.user._id,
            upVote: 0
        });

        const post = await POST.findOne({title: req.body.title, postText: req.body.postText});

        // Get all admins and moderators for this community
        const communityRoles = await COMMUNTIYROLE.find({
            community_id: communityID._id,
            role: { $in: ['admin', 'moderator'] }
        });

        // Create notifications for each admin and moderator
        const notificationPromises = communityRoles.map(async (role) => {
            // Skip notification if the post creator is the admin/moderator
            if (role.user_id.toString() === req.user._id.toString()) {
                return;
            }

            await NOTIFICATION.create({
                recipient: role.user_id,
                sender: req.user._id,
                type: 'NEW_POST',
                content: `A new post "${req.body.title}" has been created in the community "${req.params.community}"`,
                relatedCommunity: communityID._id,
                relatedPost: post._id,
                isRead: false
            });
        });

        // Wait for all notifications to be created
        await Promise.all(notificationPromises);

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

        await POST.create({
            title: req.body.caption,
            path: filePath,
            community_id: communityID._id,
            user_id: req.user._id,
            caption: req.body.content,
        });

        const post = await POST.findOne({title: req.body.caption});

        // Get all admins and moderators for this community
        const communityRoles = await COMMUNTIYROLE.find({
            community_id: communityID._id,
            role: { $in: ['admin', 'moderator'] }
        });

        // Create notifications for each admin and moderator
        const notificationPromises = communityRoles.map(async (role) => {
            // Skip notification if the post creator is the admin/moderator
            if (role.user_id.toString() === req.user._id.toString()) {
                return;
            }

            await NOTIFICATION.create({
                recipient: role.user_id,
                sender: req.user._id,
                type: 'NEW_POST',
                content: `A new file post "${req.body.caption}" has been created in the community "${req.params.community}"`,
                relatedCommunity: communityID._id,
                relatedPost: post._id,
                isRead: false
            });
        });

        // Wait for all notifications to be created
        await Promise.all(notificationPromises);

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

        // Create notification for the user
        await NOTIFICATION.create({
            recipient: userId,
            sender: req.user._id, // The admin who assigned the role
            type: 'COMMUNITY_INVITE',
            content: `You have been assigned as a moderator in the community "${community.communityName}"`,
            relatedCommunity: community._id,
            isRead: false
        });
        
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
        
        // Check if the person deleting is an admin/moderator and not the post owner
        const isAdminOrMod = await COMMUNTIYROLE.findOne({
            user_id: req.user._id,
            community_id: post.community_id,
            role: { $in: ['admin', 'moderator'] }
        });

        const isPostOwner = post.user_id.toString() === req.user._id.toString();

        // If admin/mod is deleting someone else's post, send notification
        if (isAdminOrMod && !isPostOwner) {
            await NOTIFICATION.create({
                recipient: post.user_id,
                sender: req.user._id,
                type: 'SYSTEM',
                content: `Your post "${post.title}" in community "${req.params.community}" has been deleted by a moderator due to violation of community rules.`,
                relatedCommunity: post.community_id,
                isRead: false
            });
        }
        
        // Delete the post
        await POST.findByIdAndDelete(post._id);

        await COMMENTS.deleteMany({post_id:post._id}).then(result => {
            console.log(`${result.deletedCount} comments deleted`);
          })
          .catch(err => {
            console.error("Error deleting comments:", err);
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

// Add this route with your other community routes
router.get('/:community/deassign-moderator/:userId', isAdmin, deassignModerator);

// Middleware to check if user is admin or moderator
const isAdminOrModerator = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).send("You must be logged in to access this page");
        }
        
        const community = await COMMUNITY.findOne({ communityName: req.params.community });
        if (!community) {
            return res.status(404).send("Community not found");
        }
        
        // Check if user is admin or moderator for this community
        const role = await COMMUNTIYROLE.findOne({
            user_id: req.user._id,
            community_id: community._id,
            role: { $in: ['admin', 'moderator'] }
        });
        
        if (!role) {
            return res.status(403).send("Only community admins and moderators can remove users");
        }
        
        // Add community to the request object for later use
        req.communityData = community;
        next();
    } catch (error) {
        console.error("Error checking admin/moderator status:", error);
        return res.status(500).send("Server error");
    }
};

// Route to show the remove user page
router.get('/:community/remove-user', isAdminOrModerator, async (req, res) => {
    try {
        const community = req.communityData;
        const searchQuery = req.query.search || '';
        
        // Get all users who are members of this community
        const communityMembers = await JOINCOMMUNITY.find({ communityID: community._id });
        const memberIds = communityMembers.map(member => member.userID);
        
        // Get user details with optional search
        let usersQuery = { _id: { $in: memberIds } };
        if (searchQuery) {
            usersQuery.$or = [
                { name: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } }
            ];
        }
        
        const users = await USER.find(usersQuery);
        
        // Get user roles and profile pictures
        const userRoles = await COMMUNTIYROLE.find({ 
            community_id: community._id,
            user_id: { $in: memberIds }
        });
        
        const userProfiles = await USERPROFILE.find({ user_id: { $in: memberIds } });
        
        // Combine user data with roles and profile pictures
        const usersWithDetails = users.map(user => {
            const role = userRoles.find(r => r.user_id.toString() === user._id.toString());
            const profile = userProfiles.find(p => p.user_id.toString() === user._id.toString());
            
            return {
                ...user.toObject(),
                role: role ? role.role.toUpperCase() : 'MEMBER',
                profilePicture: profile ? profile.picture_name : null
            };
        });
        
        res.render('removeUser', {
            community_name: req.params.community,
            users: usersWithDetails,
            searchQuery: searchQuery,
            curr_user: req.user,
            community: community
        });
    } catch (error) {
        console.error("Error loading remove user page:", error);
        res.status(500).send("Error loading page: " + error.message);
    }
});

// Route to handle user removal
router.post('/:community/remove-user/:userId', isAdminOrModerator, async (req, res) => {
    try {
        const community = req.communityData;
        const userId = req.params.userId;
        
        // Check if trying to remove self
        if (userId === req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You cannot remove yourself from the community'
            });
        }
        
        // Check if user is an admin
        const userRole = await COMMUNTIYROLE.findOne({
            user_id: userId,
            community_id: community._id,
            role: 'admin'
        });
        
        if (userRole) {
            return res.status(403).json({
                success: false,
                message: 'Cannot remove an admin from the community'
            });
        }
        
        // Remove user from community members
        await JOINCOMMUNITY.findOneAndDelete({
            communityID: community._id,
            userID: userId
        });
        
        // Remove any moderator role they might have
        await COMMUNTIYROLE.findOneAndDelete({
            user_id: userId,
            community_id: community._id
        });
        
        // Create notification for the removed user
        await NOTIFICATION.create({
            recipient: userId,
            sender: req.user._id,
            type: 'REMOVE_USER',
            content: `You have been removed from the community "${community.communityName}"`,
            relatedCommunity: community._id,
            isRead: false
        });
        
        return res.status(200).json({
            success: true,
            message: 'User has been removed from the community successfully'
        });
        
    } catch (error) {
        console.error("Error removing user:", error);
        return res.status(500).json({
            success: false,
            message: "Error removing user: " + error.message
        });
    }
});

module.exports = router;