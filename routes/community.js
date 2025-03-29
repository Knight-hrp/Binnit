const express = require('express');
const multer = require('multer');

const { createCommunity, getCommunity,joinCommunity, exploreCommunity } = require('../controllers/community');

const router = express.Router();

const JOINCOMMUNITY = require('../models/joinCommunity');
const POST = require('../models/post');
const COMMUNITY = require('../models/community');
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
})

router.post("/addCommunity",upload.single("image"),(req,res)=>{
    createCommunity(req.file.filename,req.body,req.user._id);
    return res.redirect("/community");
});

router.get("/explore",exploreCommunity)

router.get('/:community',async (req,res)=>{
    const community_id = await COMMUNITY.findOne({communityName: req.params.community});
    const communityPost = await POST.find({community_id: community_id._id});
    return res.render("chatBar",{Community: req.params.community,CommunityPost: communityPost});
})

router.post("/:community/postText",async (req,res)=>{
    const communityID = await COMMUNITY.findOne({communityName: req.params.community});
    console.log(communityID);
    const post = await POST.create({
        postText: req.body.message,
        community_id: communityID._id,
        user_id: req.user._id
    })

    return res.send("successful ");
});

router.post("/:community/postFile",upload.single("image"),async(req,res)=>{
    if(!req.file)
    {
        return res.status(400).send("No file uploaded");
    }
    console.log("Image received:", req.file.filename);
    const filePath = `/communityImage/${req.file.filename}`;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const room = req.params.community;
    const communityID = await COMMUNITY.findOne({communityName: req.params.community});
    const post = await POST.create({
        path: filePath,
        community_id: communityID._id,
        user_id: req.user._id,
        caption: req.body.caption,
    });
    global.io.to(room).emit("newMedia", {
        filePath,
        extension: fileExtension
    }); 
    res.json({ message: "successfully!", filename: filePath });
})

router.get("/join/:community",joinCommunity)

router.get("/:community")

    
module.exports = router;