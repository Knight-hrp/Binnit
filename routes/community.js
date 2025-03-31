const express = require('express');
const multer = require('multer');

const { createCommunity, getCommunity,joinCommunity, exploreCommunity, renderCreatePost, renderCreatePostFile } = require('../controllers/community');

const router = express.Router();

const JOINCOMMUNITY = require('../models/joinCommunity');
const POST = require('../models/post');
const COMMUNITY = require('../models/community');
const USER = require('../models/user');
const USERPROFILE = require('../models/userProfilePicture');
const path = require('path');
const {} = require('../socketHandler')



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
    res.render("addCommunity");
});

router.get("/join/:community",joinCommunity);

router.post("/addCommunity",upload.single("image"),(req,res)=>{
    const path = '/communityImage/' + req.file.filename;
    createCommunity(req.file.filename, req.body , req.user._id, path);
    return res.redirect("/community");
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
        
        res.render("insideCommunity",{
            Community: req.params.community,
            posts: communityPost,
            userProfiles: userProfiles,
            users: users
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
})

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

    
module.exports = router;