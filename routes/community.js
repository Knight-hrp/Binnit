const express = require('express');
const multer = require('multer');
const { createCommunity, getCommunity,joinCommunity,exploreCommunity } = require('../controllers/community');
const router = express.Router();
const JOINCOMMUNITY = require('../models/joinCommunity');
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

router.get('/:community',(req,res)=>{
    const community = req.params.community;
    return res.render("chatBar",{Community: community});
})

router.post("/:community/postText",async (req,res)=>{
    console.log(req.user);
    return res.send("successful ");
});

router.post("/:community/postFile",upload.single("image"),(req,res)=>{
    if(!req.file)
    {
        return res.status(400).send("No file uploaded");
    }
    console.log("Image received:", req.file.filename);
    const filePath = `/communityImage/${req.file.filename}`;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const room = req.params.community;
    global.io.to(room).emit("newMedia", {
        filePath,
        extension: fileExtension
    }); 
    res.json({ message: "successfully!", filename: filePath });
})

router.get("/join/:community",joinCommunity)

    
module.exports = router;